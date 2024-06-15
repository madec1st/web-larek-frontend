import { IApi, IRequest, IResponse, IProductsServerResponse } from "../types";
import { API_URL } from "../utils/constants";

export class CardApi implements IApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  public request<T>(request: IRequest<T>): Promise<IResponse<T>> {
    return fetch(request.url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json()
    .then(data => ({ status: response.status, data })))
    .catch(() => ({ status: 500, data: null }));
  }

  public getProducts(): Promise<IResponse<IProductsServerResponse>> {
    const request: IRequest<null> = {
      method: 'GET',
      url: `${this.baseUrl}/product/`,
      data: null
    };

    return this.request<IProductsServerResponse>(request)
      .then(response => {
        if (response.status === 200 && response.data) {
          return { status: response.status, data: response.data };
        } else {
          return { status: response.status, data: {total: 0, items: []} };
        }
    });
  }
}