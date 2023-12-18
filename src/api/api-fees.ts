import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';

export interface IFee {
  MakerFee: number;
  TakerFee: number;
}

export const apiFees = createApi({
  reducerPath: 'apiFees',
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
    getBasicFee: build.query<IFee, { id: number | string }>({
      query: ({ id }) => `/v2/exchange-router/BasicFee?Id=${id}`,
    }),
    getActualFee: build.query<any, { id: number | string; symbol: string }>({
      query: ({ id, symbol }) => `/v2/exchange-router/ActualFee?Id=${id}&Symbol=${symbol}`,
    }),
  }),
});

// @ts-ignore
export const { useGetBasicFeeQuery, useGetActualFeeQuery } = apiFees;
