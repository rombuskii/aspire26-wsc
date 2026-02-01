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
    const page = Number(event.queryStringParameters?.page ?? 1);
    const limit = 25;
    const offset = (page - 1) * limit;

    const client = await pool.connect();

    const productsQuery = `
      SELECT *
      FROM catalog
      ORDER BY id
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `SELECT COUNT(*) FROM catalog`;

    const [productsRes, countRes] = await Promise.all([
      client.query(productsQuery, [limit, offset]),
      client.query(countQuery),
    ]);

    client.release();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // restrict later
      },
      body: JSON.stringify({
        data: productsRes.rows,
        total: Number(countRes.rows[0].count),
        page,
        pageSize: limit,
      }),
    };
  } catch (err) {
    console.error('Lambda products error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
