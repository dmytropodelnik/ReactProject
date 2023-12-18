import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPriceQuery } from '../../api/api-prices';
import { useGetBalanceQuery } from '../../api/api-balances';
import { useDeleteUserMutation } from '../../api/api-users';
import { useGetActiveStrategyQuery } from '../../api/api-active-strategies';
import IBalance from '../../models/interfaces/IBalance';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import ActiveStrategyBalance from '../ActiveStrategy/ActiveStrategyBalance';
import Button from '../Button/Button';
import IChartBalance from '../../models/interfaces/IChartBalance';
import CustomConfirm from '../CustomConfirm/CustomConfirm';
import { confirmSlice } from '../../redux/confirm-slice';
import { useAppDispatch } from '../../redux/redux';
import IUsers from '../../models/interfaces/IUsers';

export interface IHomeRow {
  row: IUsers;
  isAdmin: boolean;
  refetchUsers: () => Promise<void>;
}

const HomeRow: React.FC<IHomeRow> = ({ row, isAdmin, refetchUsers }) => {
  const [balance, setBalance] = useState<IBalance[][]>([]);
  const [sellSymbol, setSellSymbol] = useState<string>('');
  const [totalBalance, setTotalBalance] = useState<IChartBalance>();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [countOfRequests, setCountOfRequests] = useState<number>(0);
  const [currentFetchId, setCurrentFetchId] = useState<number>();
  const [showConfirm, setShowConfirm] = useState<boolean>();
  const [BuyAccessValueIdArrId, setBuyAccessValueIdArrId] = useState<number[]>([]);
  const { data: activeStrategyData, isLoading: isActiveStrategyLoading } = useGetActiveStrategyQuery({ userId: row.Id });
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isSuccess,
    refetch,
  } = useGetBalanceQuery(currentFetchId ? { id: currentFetchId } : skipToken);
  const { data: priceData, isLoading: isPriceLoading } = useGetPriceQuery(
    activeStrategyData?.[0]
      ? {
          id: activeStrategyData[0].BuyAccessValueId,
          symbol: activeStrategyData[0].PairSymbol,
        }
      : skipToken,
  );

  const { setConfirmMessage } = confirmSlice.actions;
  const dispatch = useAppDispatch();
  const [deleteUser] = useDeleteUserMutation();

  const removeUser = () => {
    dispatch(setConfirmMessage('Are you sure to delete this token?'));
    setShowConfirm(!showConfirm);
  };

  const handleConfirmed = async () => {
    try {
      setIsDeleting(true);
      await deleteUser({ userId: row.Id }).unwrap();
      await refetchUsers();
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const init = () => {
      let BuyTotal: number = 0;
      let SellTotal: number = 0;
      let price: number = 0;
      if (activeStrategyData && priceData && activeStrategyData.length === countOfRequests) {
        balance.map((currentStrategyBalance: IBalance[]) => {
          return currentStrategyBalance.forEach((item) => {
            if (item?.Type === 'BuySymbol') {
              BuyTotal = BuyTotal + item.Value;
            }
            if (item?.Type === 'SellSymbol') {
              setSellSymbol(item.Name);
              SellTotal = SellTotal + item.Value;
            }
          });
        });
        price = (priceData.AskPrice + priceData.BidPrice) / 2;
        setTotalBalance({
          BuyTotal: BuyTotal,
          SellTotal: SellTotal,
          price: price,
        });
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countOfRequests, priceData, balance]);

  useEffect(() => {
    const BuyAccessValueIdId: number[] = [];
    if (activeStrategyData) {
      activeStrategyData.forEach((strategy, i) => {
        BuyAccessValueIdId.push(strategy.BuyAccessValueId);
        if (i === 0) {
          setCurrentFetchId(strategy.BuyAccessValueId);
          setCountOfRequests(1);
        }
      });
    }
    setBuyAccessValueIdArrId(BuyAccessValueIdId);
  }, [activeStrategyData]);

  useEffect(() => {
    if (!isBalanceLoading && isSuccess && countOfRequests < BuyAccessValueIdArrId.length) {
      setCurrentFetchId(BuyAccessValueIdArrId[countOfRequests]);
      setCountOfRequests(countOfRequests + 1);
      refetch();
    }
    balanceData && setBalance([...balance, balanceData]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceData]);

  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
      <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap text-center">{row.Id}</td>
      <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap text-center">{row.Name}</td>
      <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap text-center">
        <ActiveStrategyBalance
          balance={totalBalance}
          SellSymbol={sellSymbol}
          strategyType={activeStrategyData && activeStrategyData.some((strategy) => strategy.StrategyType === 2) === true ? 2 : 0}
          isLoading={isPriceLoading || isBalanceLoading || isActiveStrategyLoading}
          decimals={2}
        />
      </td>
      <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap text-center cursor-pointer">
        <div>
          <Button
            styleBtn={'btn btn-primary btn-lg'}
            disabled={isActiveStrategyLoading || isBalanceLoading || isPriceLoading}
            onClick={() => {
              navigate(`/user/${row.Id}`, {
                state: {
                  balance,
                  price: priceData && (priceData.AskPrice + priceData.BidPrice) / 2,
                  sellSymbol: row.Name,
                },
              });
            }}>
            More Info
          </Button>
        </div>
        {isAdmin && (
          <div className="mt-2">
            <Button
              styleBtn={'btn btn-danger btn-lg'}
              disabled={isActiveStrategyLoading || isBalanceLoading || isPriceLoading || isDeleting}
              onClick={() => {
                removeUser();
              }}>
              Delete
            </Button>
          </div>
        )}
        {showConfirm && (
          <CustomConfirm
            onConfirm={handleConfirmed}
            setShowModal={setShowConfirm}
            showConfirm={showConfirm}
            deleteButtonText="Delete"
            cancelButtonText="Cancel"
          />
        )}
      </td>
    </tr>
  );
};

export default HomeRow;
