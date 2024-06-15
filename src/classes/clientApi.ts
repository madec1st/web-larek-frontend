import { IApi, IRequest, IResponse } from "../types";
import { API_URL } from "../utils/constants";
import { OrderData } from "./orderData";

export class ClientApi implements IApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  public request<T>(request: IRequest<T>): Promise<IResponse<T>> {
    return fetch(request.url, {
      method: 'POST',
      body: request.data ? JSON.stringify(request.data) : null,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json()
    .then(data => ({ status: response.status, data })))
    .catch(() => ({ status: 500, data: null }));
  }

  public postOrder(orderData: OrderData): Promise<IResponse<OrderData>> {
    const request: IRequest<OrderData> = {
      method: 'POST',
      url: `${this.baseUrl}/order`,
      data: orderData
    };

    return this.request<OrderData>(request)
      .then(response => {
        if (response.status === 200 && response.data) {
          return { status: response.status, data: response.data };
        } else {
          return { status: response.status, data: null };
        }
      })
      .catch(() => ({ status: 500, data: null }));
    }
}