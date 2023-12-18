import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useContext, useState } from 'react';
import { Spinner } from '../../components/Spinner';
import { Web3Context } from '../../contexts/Web3/Web3Provider';
import { useGetUsersQuery } from '../../api/api-users';
import Authentication from '../Authentication/Authentication';
import HomeRow from './HomeRow';
import AddNewUserModalNew from './Modal/AddNewUserModalNew';
import Button from '../Button/Button';
import { CustomAlert } from '../CustomAlert/CustomAlert';
import { useAppSelector } from '../../redux/redux';
import { ModalContext } from '../../contexts/ModalProvider/ModalProvider';
import IUsers from '../../models/interfaces/IUsers';

const columns = ['ID', 'NAME', 'BALANCE', 'ACTIVE STRATEGY'];

const Home = () => {
  const { auth } = useContext(Web3Context);
  const { data, isLoading, refetch } = useGetUsersQuery(!auth && skipToken);
  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);

  const { handleModal } = useContext(ModalContext);

  const refetchUsers = async () => {
    await refetch();
  };

  if (auth) {
    return (
      <div className="max-w-[1180px] m-auto px-2">
        {isLoading ? (
          <div className="max-w-[1180px] m-auto px-2 flex items-center justify-center">
            <div className="p-4 border rounded text-sky-700 bg-sky-50 border-sky-900/10 flex items-center" role="alert">
              <Spinner />
              <strong className="text-sm font-medium">Loading...</strong>
            </div>
          </div>
        ) : data?.users?.length ? (
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {columns.map((column, i) => (
                    <th key={i} className="py-2 px-2 max-w-[25%] text-center">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.users.map((row: IUsers, i: number) => (
                  <HomeRow row={row} isAdmin={data.isAdmin} refetchUsers={refetchUsers} key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="max-w-[1180px] m-auto px-2">
            <div className="rounded border border-sky-900/10 bg-sky-50 p-6 text-sky-700 mx-auto w-fit flex flex-col items-center">
              <strong className="text-sm font-medium">No Data.</strong>
            </div>
          </div>
        )}
        {data?.isAdmin && (
          <Button
            styleBtn={'btn btn-primary btn-lg mt-4'}
            onClick={() => handleModal('Adding new user', <AddNewUserModalNew refetchUsers={refetchUsers} />)}>
            Add new user
          </Button>
        )}
        {showAlert ? <CustomAlert message={errorMessage} /> : null}
      </div>
    );
  } else {
    return (
      <div className="max-w-[1180px] m-auto px-2">
        <div className="flex flex-col">
          <Authentication />
        </div>
      </div>
    );
  }
};

export default Home;
