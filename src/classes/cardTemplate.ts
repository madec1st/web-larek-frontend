import { CardData } from "./cardData";
import { Popup } from "./popup"; 
import { CDN_URL } from "../utils/constants";

export abstract class CardTemplate extends Popup {
  protected image: string;
  protected title: string;
  protected category: string;
  protected price: number|null;
  public cardElement: HTMLElement | null = null;

  constructor(cardData: CardData) {
    super('.modal_card-preview');
    this.image = cardData.image;
    this.title = cardData.title;
    this.category = cardData.category;
    this.price = cardData.price;
  }

  protected createCard(templateId: string): void {
    const cardTemplate: HTMLTemplateElement = document.querySelector(templateId);
    this.cardElement = cardTemplate.content.querySelector('.card').cloneNode(true) as HTMLElement;
    const cardTitle = this.cardElement.querySelector('.card__title');
    const cardTag = this.cardElement.querySelector('.card__category');
    const cardImage = this.cardElement.querySelector('.card__image') as HTMLImageElement;
    const cardPrice = this.cardElement.querySelector('.card__price');

    cardTitle.textContent = this.title;
    cardTag.textContent = this.category;
    cardImage.src = `${CDN_URL}${this.image}`;
    cardImage.alt = this.title;

    if (typeof this.price === 'number') {
      cardPrice.textContent = `${this.price} синапсов`;
    } else {
      cardPrice.textContent = 'Бесценно';
    }

    const categoryClasses: Record<string, string> = {
      'софт-скил': 'card__category_soft',
      'другое': 'card__category_other',
      'дополнительное': 'card__category_additional',
      'кнопка': 'card__category_button',
      'хард-скил': 'card__category_hard'
    };
  
    const categoryClass = categoryClasses[this.category];
    if (categoryClass) {
      cardTag.classList.add(categoryClass);
    }
  }
}