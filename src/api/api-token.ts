import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';

export const apiTokens = createApi({
  reducerPath: 'apiTokens',
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
    getToken: build.query<{ token: string }, { sign: string; now: number }>({
      query: ({ sign, now }: { sign: string; now: number }) => `v2/gettoken?signature=${sign}&timestamp=${now}`,
    }),
  }),
});

// @ts-ignore
export const { useGetTokenQuery } = apiTokens;
