import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';

export const apiAccessValues = createApi({
  reducerPath: 'apiAccessValues',
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
    getAccessValues: build.query<any, { id: string | number }>({
      query: ({ id }) => `/access-value?userId=${id}`,
    }),
    updateAccessValue: build.mutation<any, { accessValueId: string | number; userId: string | number; body: any }>({
      query: ({ accessValueId, userId, body }) => ({
        url: `/access-value?Id=${accessValueId}&userId=${userId}`,
        method: 'PUT',
        body,
      }),
    }),
  }),
});

// @ts-ignore
export const { useGetAccessValuesQuery, useUpdateAccessValueMutation } = apiAccessValues;
