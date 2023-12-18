import Web3 from 'web3';
import React, { useEffect, useState } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

export interface IWeb3Context {
  account: string | null;
  currentProvider: any;
  auth: boolean;
  setAuth: Dispatch<SetStateAction<boolean>>;
  connectWallet: () => void;
}

export const Web3Context = React.createContext<IWeb3Context>({
  account: null,
  currentProvider: null,
  auth: false,
  setAuth: () => {},
  connectWallet: () => {},
});

const Web3Provider = ({ children }: { children: JSX.Element }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<any>();
  const [currentProvider, setCurrentProvider] = useState<any>();
  const [auth, setAuth] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProvider = async () => {
      setCurrentProvider(Web3.givenProvider);
      const web3api = new Web3(Web3.givenProvider);
      setAccountListener(Web3.givenProvider);
      setWeb3(web3api);
    };
    loadProvider();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    const currentTimestamp = new Date().getTime();
    const tokenExpires = JSON.parse(localStorage.getItem('token') as string)?.expiresAt;
    if (currentTimestamp > tokenExpires) {
      localStorage.removeItem('token');
      navigate('');
    }
    localStorage.getItem('token')?.length ? setAuth(true) : setAuth(false);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts && accounts[0]);
    };
    web3 && getAccounts();
  }, [web3]);

  const setAccountListener = (provider: any) => {
    provider.on('accountsChanged', (accounts: [string]) => {
      if (account !== accounts[0]) {
        setAuth(false);
        localStorage.removeItem('token');
      }
      setAccount(accounts[0]);
    });
  };

  const connectWallet = async () => {
    try {
      const accounts = await Web3.givenProvider.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        auth,
        setAuth,
        connectWallet,
        currentProvider,
      }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
