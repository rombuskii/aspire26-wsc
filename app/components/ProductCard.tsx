import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Chip,
  Stack,
  Box,
} from "@mui/material";
import { Product } from "../types/Product";
import Link from "next/link";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/products/${product.id}`}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          height: "100%",
          backgroundColor: "#121212",
          color: "grey.100",
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "transform .25s ease, box-shadow .25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          },
        }}
      >
        {/* Image */}
        <Box sx={{ overflow: "hidden" }}>
          <CardMedia
            component="img"
            height="220"
            image={product.link}
            alt={product.productdisplayname}
            sx={{
              transition: "transform .4s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          {/* Name */}
          <Typography
            sx={{
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            {product.productdisplayname}
          </Typography>

          {/* Meta */}
          <Typography
            sx={{
              fontSize: 13,
              color: "grey.400",
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            {product.articletype} • {product.basecolour}
          </Typography>

          {/* Tags */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {product.on_sale && (
              <Chip
                label="On Sale"
                size="small"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "grey.100",
                  fontSize: 11,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              />
            )}
            {product.tag && (
              <Chip
                label={product.tag.split('_')[1]}
                size="small"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  color: "grey.300",
                  fontSize: 11,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              />
            )}
          </Stack>

          {/* Price */}
          <Typography
            sx={{
              mt: 2,
              fontWeight: 700,
              letterSpacing: ".08em",
            }}
          >
            ${product.discounted_price ?? product.price}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
