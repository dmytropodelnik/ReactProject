import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';

export interface IExchange {
  Id: number;
  Name: string;
}

export const apiExchanges = createApi({
  reducerPath: 'apiExchanges',
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
    getExchanges: build.query<IExchange[], void>({
      query: () => `/exchanges`,
    }),
  }),
});

// @ts-ignore
export const { useGetExchangesQuery } = apiExchanges;
