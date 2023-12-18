import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from './ModalProvider/ModalProvider';
import Web3Provider from './Web3/Web3Provider';
import { ColorsProvider } from './ColorsProvider/ColorsProvider';

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <Web3Provider>
        <ModalProvider>
          <ColorsProvider>{children}</ColorsProvider>
        </ModalProvider>
      </Web3Provider>
    </BrowserRouter>
  );
};

export default Providers;
