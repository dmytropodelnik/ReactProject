import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';
import IBalance from '../models/interfaces/IBalance';

export const apiBalances = createApi({
  reducerPath: 'apiBalances',
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
    getBalance: build.query<IBalance[], { id: number | string }>({
      query: ({ id }) => `/v2/exchange-router/Balance?Id=${id}`,
    }),
  }),
});

// @ts-ignore
export const { useGetBalanceQuery } = apiBalances;
