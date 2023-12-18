import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';
import { IActiveStrategy } from '../views/ActiveStrategy/ActiveStrategy';

export const apiActiveStrategies = createApi({
  reducerPath: 'apiActiveStrategies',
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
    getActiveStrategy: build.query<IActiveStrategy[], { userId: string | number }>({
      query: ({ userId }) => `/active-strategy?userId=${userId}`,
    }),
    updateActiveStrategy: build.mutation<any, { activeStrategyId: string | number; userId: string | number; body: any }>({
      query: ({ activeStrategyId, userId, body }) => ({
        url: `/active-strategy?Id=${activeStrategyId}&userId=${userId}`,
        method: 'PUT',
        body,
      }),
    }),
    createCategory: build.mutation<any, { userId: string | number; body: any }>({
      query: ({ userId, body }) => ({
        url: `/active-strategy?userId=${userId}`,
        method: 'POST',
        body,
      }),
    }),
    deleteActiveStrategy: build.mutation<any, { activeStrategyId: string | number; userId: string | number }>({
      query: ({ activeStrategyId, userId }) => ({
        url: `/active-strategy?Id=${activeStrategyId}&userId=${userId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

// @ts-ignore
export const {
  useUpdateActiveStrategyMutation,
  useGetActiveStrategyQuery,
  useCreateCategoryMutation,
  useDeleteActiveStrategyMutation,
} = apiActiveStrategies;
