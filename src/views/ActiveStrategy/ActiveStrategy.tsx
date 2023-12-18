import { skipToken, SkipToken } from '@reduxjs/toolkit/dist/query';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Spinner } from '../../components/Spinner';
import { Web3Context } from '../../contexts/Web3/Web3Provider';
import { useGetActiveStrategyQuery } from '../../api/api-active-strategies';
import { useGetAccessValuesQuery } from '../../api/api-access-values';
import ActiveStrategyRow from './ActiveStrategyRow';
import AddNewStrategyModalNew from './Modals/AddNewStrategyModalNew';
import Button from '../Button/Button';
import { CustomAlert } from '../CustomAlert/CustomAlert';
import { useAppSelector } from '../../redux/redux';
import { ModalContext } from '../../contexts/ModalProvider/ModalProvider';

export interface IActiveStrategy {
  Id: number;
  StartTime: string;
  FinishTime: string;
  BuySymbol: string;
  SellSymbol: string;
  PairSymbol: string;
  BuyAccessValueId: number;
  BuyAccessValue: number;
  SellAccessValue: number;
  SellAccessValueId: number;
  UserId: number;
  StrategyType: number;
  Multiplayer: number;
  TimeDelay: number;
  TimeRandomDelta: number;
  EnabledTime: string;
  InvokesAmount: number;
}

const columns = ['Strategy Type', 'Time', 'Symbols', 'Balance', 'Planning Orders'];

const ActiveStrategy = () => {
  const { auth } = useContext(Web3Context);
  const [queryParams, setQueryParams] = useState<{ userId: string | number } | SkipToken>(skipToken);
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetActiveStrategyQuery(queryParams);
  const { data: accessValuesArray } = useGetAccessValuesQuery({ id: userId as string | number });
  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);

  const { handleModal } = useContext(ModalContext);
  const location = useLocation();
  const [sellSymbol, setSellSymbol] = useState<string>(location.state?.sellSymbol || '');

  const refetchActiveStrategies = async () => {
    await refetch();
  };

  useEffect(() => {
    setSellSymbol(location.state?.sellSymbol);
  }, [location.state?.sellSymbol]);

  useEffect(() => {
    userId && setQueryParams({ userId });
  }, [userId, auth, data]);

  return (
    <div className="max-w-[1180px] m-auto px-2">
      {isLoading ? (
        <div className="rounded border border-sky-900/10 bg-sky-50 p-6 text-sky-700 mx-auto w-fit flex flex-col items-center">
          <Spinner />
        </div>
      ) : data?.length === 0 ? (
        <div>
          <Button
            styleBtn={'btn btn-primary btn-lg mt-4'}
            onClick={() =>
              handleModal(
                'Adding new strategy',
                <AddNewStrategyModalNew
                  refetchActiveStrategies={refetchActiveStrategies}
                  accessValuesArray={accessValuesArray}
                  userId={userId as string | number}
                  sellSymbol={sellSymbol}
                />,
              )
            }>
            Add new strategy
          </Button>
        </div>
      ) : (
        <>
          <div className="relative shadow-md sm:rounded-lg">
            <table className="w-full text-xs text-left text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index} className="py-2 px-2 max-w-[25%] text-center">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((row, index) => (
                    <ActiveStrategyRow
                      key={index}
                      row={row}
                      refetchActiveStrategies={refetchActiveStrategies}
                      accessValuesArray={accessValuesArray}
                    />
                  ))}
              </tbody>
            </table>
          </div>
          <div>
            <Button
              styleBtn={'btn btn-primary btn-lg mt-4'}
              onClick={() =>
                handleModal(
                  'Adding new strategy',
                  <AddNewStrategyModalNew
                    refetchActiveStrategies={refetchActiveStrategies}
                    accessValuesArray={accessValuesArray}
                    userId={userId as string | number}
                    sellSymbol={sellSymbol}
                  />,
                )
              }>
              Add new strategy
            </Button>
            {showAlert ? <CustomAlert message={errorMessage} /> : null}
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveStrategy;
