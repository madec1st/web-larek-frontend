import { CardData } from "./cardData";
import { CardTemplate } from "./cardTemplate";

export class Card extends CardTemplate {
  private cardData: CardData

  constructor(data: CardData, handleCardClick: (data: CardData) => void) {
    super(data);
    this.cardData = data;
    this.createCard('#card-catalog');

    this.cardElement.addEventListener('click', () => handleCardClick(this.cardData))
  }

  public getCard(): HTMLElement {
    if (!this.cardElement) {
      this.createCard('#card-catalog');
    }

    return this.cardElement;
  }
}