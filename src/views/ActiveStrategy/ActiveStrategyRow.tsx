import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import SinglePlanningOrder from '../PlaningOrders/SinglePlaningOrder';
import { useGetExchangesQuery } from '../../api/api-exchanges';
import book from '../../assets/img/book.svg';
import trade from '../../assets/img/trade.svg';
import pump from '../../assets/img/pump.svg';
import { exchangeLogo } from './constants';
import { Spinner } from '../../components/Spinner';
import { useGetActualFeeQuery } from '../../api/api-fees';
import { useGetPlaningOrderQuery, useDeletePlanningOrdersMutation } from '../../api/api-planning-orders';
import { useDeleteActiveStrategyMutation } from '../../api/api-active-strategies';
import ActiveStrategyBalance from '../ActiveStrategy/ActiveStrategyBalance';
import IChartBalance from '../../models/interfaces/IChartBalance';
import Button from '../Button/Button';
import AccessValueModalNew from './Modals/AccessValueModalNew';
import { setDailyFee, setStrategyFees } from '../../redux/fees-slice';
import { CustomAlert } from '../CustomAlert/CustomAlert';
import { useAppDispatch, useAppSelector } from '../../redux/redux';
import { ModalContext } from '../../contexts/ModalProvider/ModalProvider';
import CustomConfirm from '../CustomConfirm/CustomConfirm';
import { confirmSlice } from '../../redux/confirm-slice';
import IAccessValue from '../../models/interfaces/IAccessValue';
import { IActiveStrategy } from './ActiveStrategy';
import IBalance from '../../models/interfaces/IBalance';

export interface ILocationState {
  state: {
    balance: IBalance[][];
    price: number;
    SellSymbol?: string;
  };
}

export interface IActiveStrategyRow {
  row: IActiveStrategy;
  refetchActiveStrategies: () => Promise<void>;
  accessValuesArray: IAccessValue[];
}

const ActiveStrategyRow: React.FC<IActiveStrategyRow> = ({ row, refetchActiveStrategies, accessValuesArray }) => {
  const [showSinglePlaningOrder, setShowSinglePlaningOrder] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>();
  const [dailyFee, setFeePerDay] = useState<number>(0);
  const [balance, setBalance] = useState<IChartBalance>();
  const [logo, setLogo] = useState<string>();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { userId } = useParams();
  const { data: exchangeData, isLoading: isLoadingExchange } = useGetExchangesQuery();
  const { state } = useLocation() as ILocationState;
  const navigate = useNavigate();
  const { handleModal } = useContext(ModalContext);

  const [accessValue, setAccessValue] = useState<IAccessValue>();
  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);
  const dispatch = useAppDispatch();
  const [deleteActiveStrategy] = useDeleteActiveStrategyMutation();
  const [deletePlanningOrders] = useDeletePlanningOrdersMutation();

  const { setConfirmMessage } = confirmSlice.actions;

  const removeActiveStrategy = () => {
    dispatch(
      setConfirmMessage(
        `Are you sure to delete this strategy?
        All the orders that are associated with this strategy will be deleted.`,
      ),
    );
    setShowConfirm(!showConfirm);
  };

  const handleConfirmed = async () => {
    try {
      setIsDeleting(true);
      await deletePlanningOrders({
        planningOrderId: null,
        activeStrategyId: row.Id,
        userId: userId as string | number,
      });
      await deleteActiveStrategy({
        activeStrategyId: row.Id,
        userId: userId as string | number,
      }).unwrap();
      await refetchActiveStrategies();
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const editAccessValue = (value: IAccessValue) => {
    setAccessValue(value);
  };

  useEffect(() => {}, [accessValue]);

  useEffect(() => {
    if (accessValuesArray) {
      const accessValueItem = accessValuesArray.find((i) => i.Id === row.BuyAccessValueId);
      if (accessValueItem && accessValueItem.Name) {
        setAccessValue(accessValueItem);
      }
    }
  }, [accessValuesArray, row.BuyAccessValueId]);

  useEffect(() => {
    const init = async () => {
      let BuyTotal: number = 0;
      let SellTotal: number = 0;
      if (state.balance && state.price) {
        state.balance.map((currentStrategyBalance: IBalance[]) => {
          return currentStrategyBalance.forEach((item) => {
            if (item.AccessValueId === row.BuyAccessValueId) {
              if (item?.Type === 'BuySymbol') {
                BuyTotal = BuyTotal + item.Value;
              }
              if (item?.Type === 'SellSymbol') {
                SellTotal = SellTotal + item.Value;
              }
            }
          });
        });
        setBalance({
          BuyTotal: BuyTotal,
          SellTotal: SellTotal,
          price: state.price,
        });
      }
    };
    init();
    if (state) {
      localStorage.setItem(window.location.pathname, JSON.stringify(state));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    // if (exchangeData) {
    //   const result = exchangeData.find((item) => item.Id === row.Exchange);
    //   result && setLogo(result.Name);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeData]);

  const queryParams = row.BuyAccessValueId && row.PairSymbol ? { id: row.BuyAccessValueId, symbol: row.PairSymbol } : skipToken;
  const {
    data: actualFeeData,
    refetch: refreshActualFee,
    startedTimeStamp: actualFeeStartedTimeStamp,
  } = useGetActualFeeQuery(queryParams);

  const calculateDailyFee = () => {
    if (planingOrderData && actualFeeData && actualFeeData.Fees && actualFeeData.Fees.length > 0 && planingOrderData.length > 0) {
      const feeData = actualFeeData.Fees[0];
      let fee = (planingOrderData[0].AmountAdjust + planingOrderData[0].AmountRandomDelta / 2) * 2; // average amount per two orders (buy + sell)
      fee = fee * (feeData.MakerFee + feeData.TakerFee); // average fee per minute
      fee = fee * 60 * 24; // average fee per day
      setFeePerDay(fee);

      dispatch(setStrategyFees({ strategyId: row.Id, takerFee: feeData.TakerFee, makerFee: feeData.MakerFee }));
      dispatch(setDailyFee({ strategyId: row.Id, value: fee }));
    }
  };

  const { data: planingOrderData, isLoading: isGetPlanningOrdersLoading } = useGetPlaningOrderQuery({
    activeStrategyId: row.Id,
    userId: userId as string | number,
  });

  useEffect(() => {
    if (planingOrderData && actualFeeData && actualFeeData.Fees && actualFeeData.Fees.length > 0) {
      calculateDailyFee();
    }
  }, [planingOrderData, actualFeeData]);

  return (
    <>
      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 h-[220px]">
        <td className="text-[14px] py-2 px-2 font-medium text-gray-900 whitespace-nowrap  text-center">
          <div className="flex flex-col my-4 h-full justify-between">
            <div className="flex items-center mb-2 w-[130px]">
              <img
                alt="icon"
                src={row.StrategyType === 1 ? book : row.StrategyType === 2 ? trade : row.StrategyType === 3 ? pump : ''}
                className="max-w-[50px] mr-4"
              />
              {row.StrategyType === 1 ? 'Book' : row.StrategyType === 2 ? 'Trade' : row.StrategyType === 3 ? 'Pump' : '55'}
            </div>
            {isLoadingExchange ? (
              <Spinner />
            ) : (
              logo && exchangeLogo[logo] && <img className="mt-2 max-w-[130px]" src={exchangeLogo[logo]} alt="logo" />
            )}
          </div>
        </td>
        <td className="py-2 px-2 text-[14px] font-medium text-gray-900 whitespace-nowrap ">
          <div className="flex flex-col my-4 h-[100px] justify-between">
            <div>
              <span className="text-gray-400">Start Time:</span> {row.StartTime}
            </div>
            <div>
              <span className="text-gray-400">Finish Time:</span> {row.FinishTime}
            </div>
          </div>
        </td>
        <td className="py-2 px-2 text-[14px] font-medium text-gray-900 whitespace-nowrap ">
          <div className="flex flex-col my-4 h-[100px] justify-between">
            <div>
              <span className="text-gray-400">Pair Symbol:</span> {row.PairSymbol}
            </div>
            <div>
              <span className="text-gray-400">Buy Symbol:</span> {row.BuySymbol}
            </div>
            <div>
              <span className="text-gray-400">Sell Symbol:</span> {row.SellSymbol}
            </div>
          </div>
        </td>
        <td className="py-2 px-2 font-medium text-gray-900 whitespace-nowrap ">
          {' '}
          {
            <ActiveStrategyBalance
              balance={balance}
              SellSymbol={row.SellSymbol}
              strategyType={row.StrategyType}
              isLoading={false}
              decimals={/* row.PlaningOrders[0].AmountDecimal || */ 2}
            />
          }
          {row.StrategyType === 2 ? (
            <div>
              <span>Calculated daily fee: </span>
              <span className="fw-bold bg-danger rounded text-white p-1">
                ${dailyFee % 1 === 0 ? dailyFee : dailyFee.toFixed(1)}
              </span>
            </div>
          ) : null}
        </td>
        <td className="py-2 px-2 font-medium text-gray-900 whitespace-nowrap ">
          <div className="flex flex-col h-[200px] items-center justify-between py-2 space-y-1">
            <div className="flex flex-col items-center">
              <span>{accessValue?.Name}</span>

              <Button
                styleBtn={'btn btn-primary btn-sm mt-3'}
                onClick={() =>
                  handleModal(
                    'Editing API name',
                    <AccessValueModalNew
                      key={accessValue && accessValue.Id}
                      editAccessValue={editAccessValue}
                      accessValue={accessValue as IAccessValue}
                      userId={userId as string | number}
                    />,
                  )
                }>
                Edit
              </Button>
              {showAlert ? <CustomAlert message={errorMessage} /> : null}
            </div>
            <Button
              styleBtn={'btn btn-primary btn-md mt-1'}
              onClick={() =>
                //navigate(`/user/${row.BuyAccessValueId}/control-panel/${row.PairSymbol}`, {
                navigate(`/user/${userId}/control-panel/${row.PairSymbol}`, {
                  state: {
                    activeStrategyId: row.Id,
                    strategyType: row.StrategyType,
                    accessValueId: accessValue?.Id,
                  },
                })
              }
              disabled={isLoadingExchange}>
              Control Panel
            </Button>
            {row.StrategyType === 1 ? (
              <Button
                styleBtn={'btn btn-primary btn-sm mt-1'}
                onClick={() =>
                  navigate(`/user/${userId}/active-strategy/${row.Id}`, {
                    state: {
                      balance: balance,
                      price: state.price,
                      SellSymbol: row.SellSymbol,
                    },
                  })
                }
                disabled={isLoadingExchange}>
                Settings
              </Button>
            ) : (
              <Button
                styleBtn={'btn btn-primary btn-sm mt-1'}
                onClick={() => setShowSinglePlaningOrder(!showSinglePlaningOrder)}
                disabled={isLoadingExchange}>
                Settings
              </Button>
            )}
            <Button
              styleBtn={'btn btn-danger btn-sm mt-1'}
              disabled={isLoadingExchange || isDeleting}
              onClick={() => {
                removeActiveStrategy();
              }}>
              Delete
            </Button>
            {showConfirm && (
              <CustomConfirm
                onConfirm={handleConfirmed}
                setShowModal={setShowConfirm}
                showConfirm={showConfirm}
                deleteButtonText="Delete"
                cancelButtonText="Cancel"
              />
            )}
          </div>
        </td>
      </tr>
      {showSinglePlaningOrder && (row.StrategyType === 2 || row.StrategyType === 3) && (
        <tr className="bg-white py-2 px-2 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          <td colSpan={10}>
            <SinglePlanningOrder activeStrategy={row} accessValuesArray={accessValuesArray} />
          </td>
        </tr>
      )}
    </>
  );
};

export default ActiveStrategyRow;
