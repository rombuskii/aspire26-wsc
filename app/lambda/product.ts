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
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing product id' }),
      };
    }

    const client = await pool.connect();

    const query = `
      SELECT *
      FROM catalog
      WHERE id = $1
      LIMIT 1
    `;

    const result = await client.query(query, [id]);
    client.release();

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // tighten later
      },
      body: JSON.stringify({
        data: result.rows[0],
      }),
    };
  } catch (err) {
    console.error('Lambda product by id error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
