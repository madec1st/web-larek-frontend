// require('dotenv').config();

import './scss/styles.scss';
import { IProductsServerResponse, ICardData } from './types/index'
import { CardApi,  ClientApi,  Card, CardPopup, Basket, PaymentPopup, ContactsPopup, SuccessfulOrder } from './types/classes';

const cardsContainer = document.querySelector('.gallery'); // вынести общие константы наверх файла
const cardApi = new CardApi();

cardApi.getProducts()
  .then(res => {
    console.log(res.data);//убрать при отправке на проверку
    if (res.data && res.data.items) {
      res.data.items.forEach((cardData) => {
        const card = new Card(cardData);
        card.cardElement.dataset.cardData = JSON.stringify(cardData); 
        cardsContainer.appendChild(card.getCard());
      })
    }
    
  })
  .catch(err => {
    console.log(`Код ошибки: ${err}`)
  });


cardsContainer.addEventListener('click', handleCardClick);

function handleCardClick(evt: MouseEvent): void {
  const clickedElement = evt.target as HTMLElement;

  if (clickedElement.classList.contains('gallery__item')) {
    const cardElement = clickedElement.closest('.card') as HTMLElement;
    const cardDataJSON = cardElement.dataset.cardData;

    if (cardDataJSON) {
      const cardData: ICardData = JSON.parse(cardDataJSON);
      // const cardPopup = new CardPopup(cardData, basket); //экземпляр new Basket()
      // cardPopup.openModal(cardElement);
    }
  }
}


