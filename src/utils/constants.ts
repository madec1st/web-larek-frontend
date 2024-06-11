export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {

};

export const pageWrapper = document.querySelector('.page__wrapper');
export const cardsContainer = document.querySelector('.gallery');
export const basketButton = document.querySelector('.header__basket');
export const basketCounter = document.querySelector('.header__basket-counter') as HTMLSpanElement;

export const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
export const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
export const basketItems = document.querySelectorAll('.basket__item');

export const modalContentCardPreview = document.querySelector('.modal__content_card-preview') as HTMLElement;
export const modalContentBasket = document.querySelector('.modal__content_basket') as HTMLElement;

export const formPaymentTemplate = document.querySelector('#order') as HTMLTemplateElement;
export const modalContentPayment = document.querySelector('.modal__content_payment') as HTMLElement;

export const formContactsTemplate = document.querySelector('#contacts') as HTMLTemplateElement;
export const modalContentContacts = document.querySelector('.modal__content_contacts') as HTMLElement;

export const successPopupTemplate = document.querySelector('#success') as HTMLTemplateElement;
export const modalContentSuccessfulOrder = document.querySelector('.modal__content_success') as HTMLElement;

