"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Pagination,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import { Product } from "./types/Product";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // The query actually used for API
  const [searchInput, setSearchInput] = useState(""); // Controlled input value
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/search?page=${page}&q=${encodeURIComponent(
            searchQuery
          )}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setProducts(data.data ?? []);
        setTotalPages(Math.ceil(data.total / data.pageSize));
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [page, searchQuery]);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 320, sm: 380, md: 420 },
          mb: 6,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,.85), rgba(0,0,0,.3)),
              url("https://images.unsplash.com/photo-1649513008641-7fbc7ad6d9e3?auto=format&fit=crop&w=1920&q=80")
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ color: "common.white" }}>
            <Typography variant="overline" sx={{ letterSpacing: ".25em", mb: 1 }}>
              New Season
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Trending Now
            </Typography>
            <Typography sx={{ maxWidth: 420, color: "grey.200" }}>
              Discover curated pieces that match your style.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Catalogue */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Search & Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "grey.100",
            }}
          >
            Catalogue
          </Typography>

          <TextField
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setSearchQuery(searchInput);
              }
            }}
            placeholder="Search by name, color, style…"
            sx={{
              width: { xs: "100%", sm: 320 },
              "& .MuiInputBase-root": {
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "grey.100",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.15)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.3)",
              },
              "& input::placeholder": {
                color: "grey.400",
              },
            }}
          />
        </Box>

        {/* Product Grid / Loading / Empty */}
        {loading ? (
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress sx={{ color: "grey.200" }} />
          </Box>
        ) : products.length === 0 ? (
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "grey.400",
            }}
          >
            <Typography>No products found.</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "grey.100",
                  "&.Mui-selected": {
                    backgroundColor: "grey.700",
                    color: "common.white",
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>
    </>
  );
}
