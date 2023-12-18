import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import Providers from './contexts/Providers';

const AppWithProviders: React.FC = () => {
  return (
    <Providers>
      <Provider store={store}>
        <App />
      </Provider>
    </Providers>
  );
};

export default AppWithProviders;
