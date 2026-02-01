import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { Pool } from 'pg';
import OpenAI from 'openai';

// Move pool outside handler - initialized once per container
const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 1, // Limit connections for Lambda
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 20000,
  maxRetries: 2
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  
  try {
    if (!event.body) {
      console.log('No body in request');
      return { 
        statusCode: 400, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing body' })
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
      console.log('Parsed body:', parsedBody);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { user_email, message } = parsedBody;

    if (!user_email || !message) {
      console.log('Missing user_email or message');
      return { 
        statusCode: 400, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing user_email or message' }) 
      };
    }

    // Check environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not set');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    console.log('Connecting to database...');
    let client;
    try {
      client = await pool.connect();
      console.log('Database connected');
    } catch (dbErr) {
      console.error('Database connection error:', dbErr);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Database connection failed' })
      };
    }
    
    try {
      // Get user likes
      console.log('Fetching user likes...');
      const likesRes = await client.query(
        `SELECT product_id FROM likes WHERE user_email = $1`,
        [user_email]
      );
      const likedProductIds = likesRes.rows.map(r => r.product_id);
      console.log('User likes:', likedProductIds);

      // Get catalog with all relevant fields
      console.log('Fetching catalog...');
      const catalogRes = await client.query(
        `SELECT id, productdisplayname, link, price, baseColour, trendiness, 
                articletype, gender, season, usage, discounted_price, on_sale 
         FROM catalog 
         WHERE link IS NOT NULL AND stock > 0
         ORDER BY trendiness DESC 
         LIMIT 100`
      );
      const catalog = catalogRes.rows;
      console.log('Catalog items:', catalog.length);

      // Get top trending product IDs
      const trendingIds = catalog
        .slice(0, 20)
        .map(p => p.id);
      console.log('Trending products:', trendingIds);

      // Build smarter prompt
      const prompt = `
You are a helpful fashion product recommendation assistant. Analyze the user's request carefully and recommend products that match what they're asking for.

User's liked products (IDs): ${likedProductIds.join(', ') || 'none'}
Currently trending products (IDs): ${trendingIds.join(', ') || 'none'}

Available products in catalog:
${catalog.map(p => `ID: ${p.id} | Name: ${p.productdisplayname} | Type: ${p.articletype} | Gender: ${p.gender} | Season: ${p.season} | Usage: ${p.usage} | Price: $${p.price} | Color: ${p.baseColour} | On Sale: ${p.on_sale} | Link: ${p.link}`).join('\n')}

User's request: "${message}"

IMPORTANT INSTRUCTIONS:
1. Carefully analyze what the user is asking for (e.g., "shorts", "shirts", "jackets", "summer wear", "formal wear", specific colors, etc.)
2. Match products based on articletype, season, usage, gender, and baseColour fields
3. If the user asks for a specific item type that doesn't exist in the catalog, respond with a helpful message explaining what's available instead
4. Consider the user's liked products and trending items when appropriate
5. Recommend up to 5 products that best match their request

Response format - return ONLY valid JSON, no other text:
{
  "recommendations": [
    { 
      "id": "product_id", 
      "name": "product name", 
      "link": "image url",
      "price": price_number,
      "discounted_price": discounted_price_or_null,
      "on_sale": boolean,
      "baseColour": "color",
      "reason": "brief reason why this matches their request"
    }
  ],
  "message": "A friendly message to the user about the recommendations"
}

If no products match their request, return:
{
  "recommendations": [],
  "message": "I couldn't find any [requested item] in our catalog. However, we have [alternative suggestions]. Would you like to see those instead?"
}
`;

      // Call OpenAI
      console.log('Calling OpenAI...');
      let completion;
      try {
        completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        });
        console.log('OpenAI response received');
      } catch (openaiErr) {
        console.error('OpenAI API error:', openaiErr);
        return {
          statusCode: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            message: 'I had trouble connecting to my AI service. Please try again in a moment.',
            recommendations: []
          })
        };
      }

      // Parse JSON response
      let recommendedProducts = [];
      let messageText = 'Sorry, I couldn\'t process your request.';
      
      try {
        const text = completion.choices[0].message?.content || '';
        console.log('GPT response text:', text);
        const match = text.match(/\{.*\}/s);
        if (match) {
          const json = JSON.parse(match[0]);
          recommendedProducts = json.recommendations || [];
          messageText = json.message || messageText;
        }
      } catch (err) {
        console.warn('Could not parse GPT JSON response', err);
        messageText = 'I had trouble processing that request. Could you try asking in a different way?';
      }

      console.log('Returning success response');
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          message: messageText,
          recommendations: recommendedProducts 
        }),
      };
      
    } finally {
      // Always release the client back to the pool
      if (client) {
        client.release();
        console.log('Database client released');
      }
    }
    
  } catch (err) {
    console.error('POST /chat error:', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'An unexpected error occurred. Please try again.',
        recommendations: [],
        error: 'Internal server error' 
      }) 
    };
  }
};