import { Recommendation } from "./Recommendation";

export interface Message {
  role: 'user' | 'bot';
  content: string;
  recommendations?: Recommendation[];
}