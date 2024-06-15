import { ICardData } from "../types";

export class CardData implements ICardData {
  image: string;
  title: string;
  category: string;
  price: number|null;
  cardElement: HTMLElement | null = null;

  constructor(data: ICardData) {
    this.image = data.image;
    this.title = data.title;
    this.category = data.category;
    this.price = data.price;
  }
}