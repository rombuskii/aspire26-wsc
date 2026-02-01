import { Product } from '@/app/types/Product';
import ProductClient from './ProductClient';
import React from 'react';

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/products`);
  const data = await res.json();    

  return data.data.map((product: Product) => ({
    id: product.id.toString(),
  }));
}

export default async function Page({ params }: { params: { id: string } }) {
  // 👇 EXPLICITLY pass id
  const { id } = await params
  console.log(id)
  return <ProductClient productId={id} />;
}

