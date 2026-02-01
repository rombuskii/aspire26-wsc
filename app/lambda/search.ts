import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { Pool } from 'pg';

// Postgres pool — small for Lambda
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
    // Pagination
    const page = Number(event.queryStringParameters?.page ?? 1);
    const pageSize = Number(event.queryStringParameters?.pageSize ?? 25);
    const offset = (page - 1) * pageSize;

    // Search query
    const query = (event.queryStringParameters?.q || '').trim();

    // Prepare tsquery if query is >= 2 chars
    let tsQuery: string | null = null;

    if (query.length >= 2) {
      tsQuery = query
        .split(/\s+/)          // split words by space
        .map((w) => w + ':*')  // add prefix search
        .join(' & ');          // AND operator
    }

    // Connect to RDS
    const client = await pool.connect();

    let productsQuery: string;
    let countQuery: string;
    let queryValues: unknown[];

    if (tsQuery) {
      // Full-text search
      productsQuery = `
        SELECT *
        FROM catalog
        WHERE search_vector @@ to_tsquery($1)
        ORDER BY ts_rank_cd(search_vector, to_tsquery($1)) DESC
        LIMIT $2 OFFSET $3
      `;
      countQuery = `
        SELECT COUNT(*) 
        FROM catalog
        WHERE search_vector @@ to_tsquery($1)
      `;
      queryValues = [tsQuery, pageSize, offset];
    } else {
      // No search or too short → return paginated results
      productsQuery = `
        SELECT *
        FROM catalog
        ORDER BY id
        LIMIT $1 OFFSET $2
      `;
      countQuery = `SELECT COUNT(*) FROM catalog`;
      queryValues = [pageSize, offset];
    }

    // Run queries concurrently
    const [productsRes, countRes] = await Promise.all([
      client.query(productsQuery, queryValues),
      client.query(countQuery, tsQuery ? [tsQuery] : []),
    ]);

    client.release();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        data: productsRes.rows,
        total: Number(countRes.rows[0].count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(countRes.rows[0].count) / pageSize),
      }),
    };
  } catch (err) {
    console.error('Lambda search error:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error'}),
    };
  }
};
