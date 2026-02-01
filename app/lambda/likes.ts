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
    const email = event.pathParameters?.email;
    if (!email) return { statusCode: 400, body: 'Missing email' };

    const client = await pool.connect();
    const result = await client.query(
      `SELECT product_id FROM likes WHERE user_email = $1`,
      [email]
    );
    client.release();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ liked: result.rows.map(row => row.product_id) }),
    };
  } catch (err) {
    console.error('GET /likes/{email} error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
