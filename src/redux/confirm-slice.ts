import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ConfirmState {
  message: string;
}

const initialState: ConfirmState = {
  message: '',
};

export const confirmSlice = createSlice({
  name: 'confirm',
  initialState,
  reducers: {
    setConfirmMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
  },
});

export const { setConfirmMessage } = confirmSlice.actions;
export default confirmSlice.reducer;
