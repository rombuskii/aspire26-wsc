'use client';
import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import Link from 'next/link';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query) {
        setResults([]);
        setPage(1);
        setTotalPages(1);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=10`);
        const data = await res.json();
        setResults(data.data);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
        setResults([]);
      }
    }, 250); // debounce

    return () => clearTimeout(handler);
  }, [query, page]);

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        placeholder="Search products..."
        className="w-full p-2 border rounded"
      />
      <Box
  sx={{
    position: 'absolute',
    top: '100%',       // right below the input
    left: 0,
    right: 0,
    zIndex: 1000,      // above navbar
    backgroundColor: 'white',
    boxShadow: 3,
    borderRadius: 1,
    mt: 0.5,
  }}
>
      {results?.length > 0 && (
        <>
          <ul className="border mt-1 rounded bg-white max-h-60 overflow-auto">
            {results.map((r) => (
            <Link key={r.id} href={`/products/${r.id}`}>
              <li className="p-2 hover:bg-gray-100">
                {r.productdisplayname} ({r.basecolour}) - ${r.price}
              </li>
              </Link>
            ))}
          </ul>

          <div className="flex justify-between mt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
      </Box>
    </div>
  );
}
