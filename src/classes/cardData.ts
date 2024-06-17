import { ICardData } from "../types";

export class CardData implements ICardData {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number|null;
  cardElement?: HTMLElement | null = null;

  constructor(data: ICardData) {
    this.id = data.id;
    this.description = data.description;
    this.image = data.image;
    this.title = data.title;
    this.category = data.category;
    this.price = data.price;
  }
}