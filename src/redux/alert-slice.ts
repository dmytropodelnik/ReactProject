import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface AlertMessageState {
  showAlert: boolean;
  errorMessage: string;
}

const initialState: AlertMessageState = {
  showAlert: false,
  errorMessage: '',
};

export const alertMessageSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setShowAlert(state, actions: PayloadAction<boolean>) {
      state.showAlert = actions.payload;
    },
    setAlertMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
    },
  },
});

export const { setShowAlert, setAlertMessage } = alertMessageSlice.actions;
export default alertMessageSlice.reducer;
