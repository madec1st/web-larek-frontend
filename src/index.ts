// require('dotenv').config();

import './scss/styles.scss';
import { IProductsServerResponse, ICardData } from './types/index'
import { CardApi,  ClientApi,  Card, CardPopup, Basket, PaymentPopup, ContactsPopup, SuccessfulOrder } from './types/classes';


const cardApi = new CardApi();
cardApi.getProducts()
  .then(res => {
    console.log(res.data);//убрать при отправке на проверку
    if (res.data && res.data.items) {
      res.data.items.forEach((cardData) => {
        const card = new Card(cardData);
        const productList = document.querySelector('.gallery');
        productList.appendChild(card.getCard());
      })
    }
  })
  .catch(err => {
    console.log(err)
  });




// <template id="card-catalog">
// <button class="gallery__item card">
//   <span class="card__category card__category_soft">софт-скил</span>
//   <h2 class="card__title">+1 час в сутках</h2>
//   <img class="card__image" src="<%=require('../images/Subtract.svg')%>" alt="" />
//   <span class="card__price">750 синапсов</span>
// </button>
// </template>


  // export interface ICardData {
  //   id?: string;
  //   description?: string;
  //   image: string;
  //   title: string;
  //   category: string;
  //   price: number|null;
  // }