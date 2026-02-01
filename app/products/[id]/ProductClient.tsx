'use client';

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Product } from '@/app/types/Product';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';

export default function ProductClient({ productId }: { productId: string }) {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [product, setProduct] = useState<Product | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API}/products/${productId}`)
      .then(res => res.json())
      .then(res => setProduct(res.data));

    if (isAuthenticated) {
    fetch(`${process.env.NEXT_PUBLIC_API}/likes/${user?.email}`)
      .then(res => res.json())
      .then(res => {
        // res.liked is now an array of product IDs
        const likedIds: string[] = res.liked || [];
        setLiked(likedIds.includes(productId));
      })
      .catch(err => {
        console.error('Error fetching likes:', err);
      });
  }
  }, [productId, isAuthenticated, user?.email]);

  const toggleLike = async () => {
  if (!isAuthenticated) return loginWithRedirect();

  const payload = { user_email: user?.email, product_id: product?.id };

  if (liked) {
    await fetch(`${process.env.NEXT_PUBLIC_API}/likes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLiked(false);
  } else {
    await fetch(`${process.env.NEXT_PUBLIC_API}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLiked(true);
  }
};

  if (!product) return <div>Loading...</div>;

  return (
    <>
    <Navbar />
    <div style={{
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',   // centers horizontally
    justifyContent: 'center', // centers vertically (optional)
    textAlign: 'center',      // centers text inside elements
    minHeight: '100vh',       // optional: fills full viewport height
  }}>
      <h1>{product.productdisplayname}</h1>
      <img
        src={product.link}
        alt={product.productdisplayname}
        width={300}
        height={400}
      />
      <p>Price: {product.price}</p>
      <p>Color: {product.baseColour}</p>
      <button onClick={toggleLike}>
        {liked ? '❤️ Liked' : '🤍 Like'}
      </button>
    </div>
    </>
  );
}
