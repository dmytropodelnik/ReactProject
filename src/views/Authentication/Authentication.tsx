import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useContext, useEffect, useState } from 'react';
import { Spinner } from '../../components/Spinner';
import { Web3Context } from '../../contexts/Web3/Web3Provider';
import { useGetTokenQuery } from '../../api/api-token';
import { getTokenMsg } from './AuthenticationUtils';
import Button from '../Button/Button';

const Authentication = () => {
  const [isNotAllowed, setIsNotAllowed] = useState(false);
  const { account, currentProvider, setAuth } = useContext(Web3Context);
  const [tokenQueyParams, setTokenQueyParams] = useState<any>(skipToken);
  const localStorageKey = 'token';
  const { data, isLoading } = useGetTokenQuery(tokenQueyParams);
  const tokenExpirationTime = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    setIsNotAllowed(false);
    if (data?.token) {
      if (data.token === 'Address not found in either Permits or Admin table') {
        localStorage.removeItem(localStorageKey);
        setIsNotAllowed(true);
        setAuth(false);
      } else {
        const expirationDate = new Date().getTime() + tokenExpirationTime;
        localStorage.setItem(localStorageKey, JSON.stringify({ token: data.token, expiresAt: expirationDate }));
        setAuth(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onAuthenticateClick = async () => {
    const now = new Date();
    const msg = getTokenMsg(now);
    const params = [msg, account];
    const method = 'personal_sign';
    currentProvider.sendAsync(
      {
        method,
        params,
        from: account,
      },
      async (err: any, result: any) => {
        if (err) return console.log(err);
        if (result.error) return console.log(result.error);
        const seconds = Math.floor(new Date(now).getTime() / 1000);
        setTokenQueyParams({
          sign: result.result,
          now: new Date(now).getTime(),
        });
      },
    );
  };

  if (isLoading)
    return (
      <div className="max-w-[1180px] m-auto px-2 flex items-center justify-center">
        <div className="p-4 border rounded text-sky-700 bg-sky-50 border-sky-900/10 flex items-center" role="alert">
          <Spinner />
          <strong className="text-sm font-medium">Loading...</strong>
        </div>
      </div>
    );
  if (isNotAllowed)
    return (
      <div className="max-w-[1180px] m-auto px-2 flex items-center justify-center">
        <div className="p-4 text-red-700 border rounded border-red-900/10 bg-red-50" role="alert">
          <strong className="text-sm font-medium">
            You are not allowed to use this application, please connect another wallet and refresh the page
          </strong>
        </div>
      </div>
    );
  return (
    <div>
      <div className="p-14 text-center text-2xl">
        <div className="p-4  text-green-700 border rounded border-green-900/10 bg-green-50 w-fit m-auto" role="alert">
          <strong className="text-m font-medium "> Please sign to authenticate yourself </strong>
        </div>
        <br />
        <Button styleBtn={'btn btn-primary btn-lg gap-2'} onClick={onAuthenticateClick}>
          Authenticate
        </Button>
      </div>
    </div>
  );
};
export default Authentication;
