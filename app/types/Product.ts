export interface Product {
  id: number;
  gender: string;
  masterCategory: string;
  subCategory: string;
  articleType: string;
  baseColour: string;
  season: string;
  year: number;
  usage: string;
  productdisplayname: string;
  filename: string;
  link: string;
  price: number;
  discounted_price?: number;
  on_sale: boolean;
  stock: number;
  tag?: string;
}