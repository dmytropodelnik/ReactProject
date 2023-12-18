import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { apiTokens } from '../api/api-token';
import { apiAccessValues } from '../api/api-access-values';
import { apiActiveStrategies } from '../api/api-active-strategies';
import { apiBalances } from '../api/api-balances';
import { apiFees } from '../api/api-fees';
import { apiExchanges } from '../api/api-exchanges';
import { apiPlanningOrders } from '../api/api-planning-orders';
import { apiPrices } from '../api/api-prices';
import { apiUsers } from '../api/api-users';
import { alertMessageSlice } from './alert-slice';
import { feesSlice } from './fees-slice';
import { confirmSlice } from './confirm-slice';

const reducers = combineReducers({
  [apiTokens.reducerPath]: apiTokens.reducer,
  [apiAccessValues.reducerPath]: apiAccessValues.reducer,
  [apiActiveStrategies.reducerPath]: apiActiveStrategies.reducer,
  [apiBalances.reducerPath]: apiBalances.reducer,
  [apiFees.reducerPath]: apiFees.reducer,
  [apiExchanges.reducerPath]: apiExchanges.reducer,
  [apiPlanningOrders.reducerPath]: apiPlanningOrders.reducer,
  [apiPrices.reducerPath]: apiPrices.reducer,
  [apiUsers.reducerPath]: apiUsers.reducer,
  fees: feesSlice.reducer,
  alert: alertMessageSlice.reducer,
  confirm: confirmSlice.reducer,
});

const apiMiddleware = [
  apiTokens.middleware,
  apiAccessValues.middleware,
  apiActiveStrategies.middleware,
  apiBalances.middleware,
  apiFees.middleware,
  apiExchanges.middleware,
  apiPlanningOrders.middleware,
  apiPrices.middleware,
  apiUsers.middleware,
];

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(/*{ thunk: false, serializableCheck: false }*/).concat(apiMiddleware),
});

export type RootState = ReturnType<typeof reducers>;
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
