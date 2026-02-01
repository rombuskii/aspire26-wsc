import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) return { statusCode: 400, body: 'Missing body' };
    const { user_email, product_id } = JSON.parse(event.body);

    if (!user_email || !product_id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing user_email or product_id' }) };
    }

    const client = await pool.connect();
    await client.query(
      `DELETE FROM likes WHERE user_email = $1 AND product_id = $2`,
      [user_email, product_id]
    );
    client.release();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('DELETE /likes error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
