"use client"

import { useEffect, useState } from "react";
import { Box, Card, CardContent, Container, Pagination, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/GridLegacy';
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import { Product } from "./types/Product";
import LoginButton from "./components/LoginButton";
import { Auth0Provider } from '@auth0/auth0-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API}/products?page=${page}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.data);
        setTotalPages(data.page);
      });
  }, [page]);

  console.log(products)

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
    </>
  );
}
