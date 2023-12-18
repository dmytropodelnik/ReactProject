import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';

export interface IPrice {
  AskPrice: number;
  BidPrice: number;
}

export const apiPrices = createApi({
  reducerPath: 'apiPrices',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://urhomts21c.execute-api.us-east-2.amazonaws.com/Prod',
    prepareHeaders: (headers) => {
      const tokenItem = localStorage.getItem('token');
      let token;
      if (tokenItem !== null) {
        const tokenData: ITokenData = JSON.parse(tokenItem);
        token = tokenData.token;
      }
      if (token) {
        headers.set('token', token);
      }
      return headers;
    },
  }),
  endpoints: (build) => ({
    getPrice: build.query<IPrice, { id: number | string; symbol: string }>({
      query: ({ id, symbol }) => `/v2/exchange-router/Price?Id=${id}&Symbol=${symbol}`,
    }),
  }),
});

// @ts-ignore
export const { useGetPriceQuery } = apiPrices;
