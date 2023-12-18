import Web3 from 'web3';

export const getTokenMsg = (now: Date) => {
  return `/gettoken?timestamp=${now.getTime()}`;
};

export const getAddressFromSign = (sign: string, data: string): string => {
  // const address= await thePoolz.web3.eth.personal.ecRecover(data, sign)
  const web3 = new Web3();
  const address = web3.eth.accounts.recover(data, sign);
  return address;
};

export type signData = {
  sign: string;
  msg: string;
  timestamp: Date;
};
