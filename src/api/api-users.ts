import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';

export const apiUsers = createApi({
  reducerPath: 'apiUsers',
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
    getUsers: build.query<any, false | void>({
      query: () => `/user`,
    }),
    getUserById: build.query<any, { userId: string | number }>({
      query: ({ userId }) => `/user?Id=${userId}`,
    }),
    createUser: build.mutation<any, { body: any }>({
      query: ({ body }) => ({
        url: `/user`,
        method: 'POST',
        body,
      }),
    }),
    deleteUser: build.mutation<any, { userId: string | number }>({
      query: ({ userId }) => ({
        url: `/user?Id=${userId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

// @ts-ignore
export const { useGetUsersQuery, useGetUserByIdQuery, useCreateUserMutation, useDeleteUserMutation } = apiUsers;
