import { ICardData } from "../types";
import { CardTemplate } from "./cardTemplate";

export class Card extends CardTemplate {
  constructor(data: ICardData) {
    super(data);
    this.createCard('#card-catalog');
  }

  public getCard(): HTMLElement {
    if (!this.cardElement) {
      this.createCard('#card-catalog');
    }
    return this.cardElement;
  }
}