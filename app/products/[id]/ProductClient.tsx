"use client";

import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Product } from "@/app/types/Product";
import Navbar from "@/app/components/Navbar";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";

export default function ProductClient({ productId }: { productId: string }) {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [product, setProduct] = useState<Product | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/products/${productId}`);
        const data = await res.json();
        setProduct(data.data);

        if (isAuthenticated) {
          const likesRes = await fetch(`${process.env.NEXT_PUBLIC_API}/likes/${user?.email}`);
          const likesData = await likesRes.json();
          const likedIds: string[] = likesData.liked || [];
          setLiked(likedIds.includes(productId));
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isAuthenticated, user?.email]);

  const toggleLike = async () => {
    if (!isAuthenticated) return loginWithRedirect();

    const payload = { user_email: user?.email, product_id: product?.id };

    try {
      if (liked) {
        setLiked(false);
        await fetch(`${process.env.NEXT_PUBLIC_API}/likes`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        setLiked(true);
        await fetch(`${process.env.NEXT_PUBLIC_API}/likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  if (loading || !product)
    return (
      <>
        <Navbar />
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#111",
          }}
        >
          <CircularProgress sx={{ color: "grey.200" }} />
        </Box>
      </>
    );

  return (
    <>
      <Navbar />

      <Box
        sx={{
          backgroundColor: "#111",
          color: "grey.100",
          py: 6,
          minHeight: "100vh",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 6,
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          {/* Product Image */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Box
              component="img"
              src={product.link}
              alt={product.productdisplayname}
              sx={{
                width: { xs: "80%", md: "100%" },
                maxWidth: 400,
                borderRadius: 2,
                boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
              }}
            />
          </Box>

          {/* Product Info */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, mb: 1, textTransform: "uppercase" }}
            >
              {product.productdisplayname}
            </Typography>
            <Typography sx={{ color: "grey.400", mb: 2 }}>
              {product.articletype} • {product.basecolour}
            </Typography>

            {product.on_sale && <Chip label="On Sale" color="success" sx={{ mb: 2 }} />}

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
              ${product.discounted_price ?? product.price}
            </Typography>

            <Button
              variant={liked ? "contained" : "outlined"}
              color="secondary"
              onClick={toggleLike}
              sx={{
                borderRadius: 999,
                px: 4,
                py: 1.5,
                textTransform: "uppercase",
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: liked ? "secondary.dark" : "rgba(255,255,255,0.1)",
                },
              }}
            >
              {liked ? "❤️ Liked" : "🤍 Like"}
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
