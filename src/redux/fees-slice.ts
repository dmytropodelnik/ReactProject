import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface DailyFeesState {
  [strategyId: number]: number;
}

interface FeesState {
  dailyFees: DailyFeesState;
  strategyFees: Record<number, { takerFee: number; makerFee: number }>;
}

export const feesSlice = createSlice({
  name: 'fees',
  initialState: {
    dailyFees: {} as DailyFeesState,
    strategyFees: {},
  } as FeesState,
  reducers: {
    setDailyFee: (state, action: PayloadAction<{ strategyId: number; value: number }>) => {
      const { strategyId, value } = action.payload;
      state.dailyFees[strategyId] = value;
    },
    setStrategyFees: (
      state,
      action: PayloadAction<{
        strategyId: number;
        takerFee: number;
        makerFee: number;
      }>,
    ) => {
      const { strategyId, takerFee, makerFee } = action.payload;
      state.strategyFees[strategyId] = { takerFee, makerFee };
    },
  },
});

export const { setDailyFee, setStrategyFees } = feesSlice.actions;
export default feesSlice.reducer;
