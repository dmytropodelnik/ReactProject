import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3/Web3Provider';
import formatAddress from '../utils/formatAddress';
import { BreadCrumbs } from './BreadCrumbs';
import { NavLink } from 'react-router-dom';
import Button from '../views/Button/Button';
import CustomConfirm from '../views/CustomConfirm/CustomConfirm';
import { confirmSlice } from '../redux/confirm-slice';
import { useAppDispatch } from '../redux/redux';

const TopBar = () => {
  const { account, connectWallet } = useContext(Web3Context);
  const [showConfirm, setShowConfirm] = useState<boolean>();

  const { setConfirmMessage } = confirmSlice.actions;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logOut = () => {
    dispatch(setConfirmMessage('Do you really want to log out?'));
    setShowConfirm(!showConfirm);
  };

  const handleConfirmed = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="w-full">
      <div className="max-w-[1180px] m-auto pt-8 px-2 flex justify-between">
        <NavLink to="/" className="text-3xl font-bold tracking-tight text-center sm:text-5xl text-indigo-600">
          MM-office
        </NavLink>
        <div className="flex items-center justify-center">
          {account ? (
            <div>
              <div className="flex items-center justify-center text-xl font-bold tracking-tight text-center sm:text-m text-indigo-600">
                {formatAddress(account)}
              </div>
              {localStorage.getItem('token') && (
                <div>
                  <Button
                    styleBtn={
                      'btn btn-outline-primary rounded w-100 h-10 my-2 position-relative inline-flex items-center px-8 py-1 overflow-hidden text-indigo border border-primary group active:text-indigo-500 focus:outline-none focus:ring'
                    }
                    onClick={logOut}>
                    Logout
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button
              styleBtn={
                'btn btn-outline-primary rounded position-relative inline-flex items-center px-8 py-5 overflow-hidden text-indigo border border-primary group active:text-indigo-500 focus:outline-none focus:ring'
              }
              onClick={connectWallet}>
              <span className="absolute left-0 transition-transform -translate-x-full group-hover:translate-x-4">
                <svg className="w-5 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <span className="text-sm font-medium transition-all group-hover:ml-8">Connect Wallet</span>
            </Button>
          )}
        </div>
      </div>
      <div className="max-w-[1180px] m-auto py-8 px-2 flex">
        <BreadCrumbs />
      </div>
      {showConfirm && (
        <CustomConfirm
          onConfirm={handleConfirmed}
          setShowModal={setShowConfirm}
          showConfirm={showConfirm}
          deleteButtonText={'Logout'}
          cancelButtonText={'Back'}
        />
      )}
    </div>
  );
};

export default TopBar;
