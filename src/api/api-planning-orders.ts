import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import ITokenData from '../models/interfaces/ITokenData';
import { IPlaningOrders } from '../views/PlaningOrders/PlaningOrders';
import { IOpenOrder } from '../components/Charts/OpenOrdersChart';

export interface IMyOpenOrders {
  OpenOrders: IOpenOrder[];
}

export const apiPlanningOrders = createApi({
  reducerPath: 'apiPlanningOrders',
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
    getPlaningOrder: build.query<IPlaningOrders[], { activeStrategyId: string | number; userId: string | number }>({
      query: ({ activeStrategyId, userId }) => `/planing-order?activeStrategyId=${activeStrategyId}&userId=${userId}`,
    }),
    getMyOpenOrder: build.query<IMyOpenOrders, { id: string | number; symbol: string }>({
      query: ({ id, symbol }) => `/v2/exchange-router/MyOpenOrders?Id=${id}&Symbol=${symbol}`,
    }),
    createPlanningOrder: build.mutation<
      IPlaningOrders,
      { userId: string; symbol: string; price: string; amount: string; isBuyOrder: boolean }
    >({
      query: ({ userId, symbol, price, amount, isBuyOrder }) => ({
        url: `v2/exchange-router/MakeOrder?Id=${userId}&Symbol=${symbol}&Side=${
          isBuyOrder ? 'BUY' : 'SELL'
        }&Type=${0}&Amount=${amount}&Price=${price}`,
        method: 'GET',
      }),
    }),
    createPlanningOrders: build.mutation<any, { userId: string | number; body: any }>({
      query: ({ userId, body }) => ({
        url: `/planing-order?userId=${userId}`,
        method: 'POST',
        body,
      }),
    }),
    updatePlanningOrders: build.mutation<IPlaningOrders[], { id: number; userId: string | number; body: any }>({
      query: ({ id, userId, body }) => ({
        url: `/planing-order?Id=${id}&userId=${userId}`,
        method: 'PUT',
        body,
      }),
    }),
    deletePlanningOrders: build.mutation<
      any,
      { planningOrderId: string | null; activeStrategyId: number | null; userId: string | number }
    >({
      query: ({ planningOrderId, userId, activeStrategyId }) => ({
        url: `/planing-order?id=${planningOrderId}&userId=${userId}&activeStrategyId=${activeStrategyId}`,
        method: 'DELETE',
      }),
    }),
    cancelOrder: build.mutation<any, { id: string | number; symbol: string; orderId: string }>({
      query: ({ id, symbol, orderId }) => ({
        url: `/v2/exchange-router/CancelOrder?Id=${id}&Symbol=${symbol}&OrderId=${orderId}`,
        method: 'GET',
      }),
    }),
    cancelOrders: build.mutation<any, { id: string | number; symbol: string }>({
      query: ({ id, symbol }) => ({
        url: `/v2/exchange-router/CancelOrders?Id=${id}&Symbol=${symbol}`,
        method: 'GET',
      }),
    }),
  }),
});
// @ts-ignore
export const {
  useGetPlaningOrderQuery,
  useGetMyOpenOrderQuery,
  useCreatePlanningOrderMutation,
  useUpdatePlanningOrdersMutation,
  useCancelOrderMutation,
  useCancelOrdersMutation,
  useCreatePlanningOrdersMutation,
  useDeletePlanningOrdersMutation,
} = apiPlanningOrders;
