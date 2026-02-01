import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Chip,
  Stack
} from "@mui/material";
import { Product } from "../types/Product";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Card>
      <CardMedia
        component="img"
        height="200"
        image={product.link}
        alt={product.productdisplayname}
      />

      <CardContent>
        <Typography fontWeight={600}>
          {product.productdisplayname}
        </Typography>

        <Typography color="text.secondary">
          {product.articleType} • {product.baseColour}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {product.on_sale && <Chip label="On Sale" color="success" />}
          {product.tag && <Chip label={product.tag} />}
        </Stack>

        <Typography sx={{ mt: 1 }}>
          ${product.discounted_price ?? product.price}
        </Typography>
      </CardContent>
    </Card>
  );
}
