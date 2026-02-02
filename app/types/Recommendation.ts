export interface Recommendation {
  id: string;
  name: string;
  link: string;
  price: number;
  discounted_price?: number;
  on_sale: boolean;
  baseColour: string;
  reason?: string;
}