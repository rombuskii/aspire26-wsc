export interface Product {
  id: number;
  gender: string;
  masterCategory: string;
  subCategory: string;
  articletype: string;
  basecolour: string;
  season: string;
  year: number;
  usage: string;
  productdisplayname: string;
  filename: string;
  link: string; //Link to live image URL 
  price: number;
  discounted_price?: number;
  on_sale: boolean;
  stock: number;
  tag?: string;
  trendiness?: number;
}