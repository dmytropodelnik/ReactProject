import { skipToken } from '@reduxjs/toolkit/dist/query';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import OpenOrdersChart from '../../components/Charts/OpenOrdersChart';
import { useGetPriceQuery } from '../../api/api-prices';
import { useGetBalanceQuery } from '../../api/api-balances';
import { useGetMyOpenOrderQuery, useCancelOrderMutation, useCancelOrdersMutation } from '../../api/api-planning-orders';
import { IOpenOrder } from '../../components/Charts/OpenOrdersChart';
import { getTimeDifferenceShortString } from '../../utils/timespan';
import Dropdown from '../PlaningOrders/Dropdown/Dropdown';
import CancelAllOrdersDialog from './CancelAllOrdersDialog';
import CancelDialog from './CancelDialog';
import MakeNewOrderDialog from './MakeNewOrderDialog';
import OpenOrdersRow from './OpenOrdersRow';
import Button from '../Button/Button';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/store';
import { ModalContext } from '../../contexts/ModalProvider/ModalProvider';
import CustomConfirm from '../CustomConfirm/CustomConfirm';
import { confirmSlice } from '../../redux/confirm-slice';
import { useAppDispatch } from '../../redux/redux';

const greenColumns = ['№', 'Price', 'Amount', 'Cumulative Amount', 'Total', 'Controls'];
const redColumns = ['№', 'Price', 'Amount', 'Cumulative Amount', 'Total', 'Controls'];

const calculateCumulativeAmount = (activeFormat: string, order: IOpenOrder, allOrders: IOpenOrder[]) => {
  const index = allOrders.findIndex((o) => o.Id === order.Id);
  const orders = allOrders.slice(0, index + 1);
  const cumulativeAmount = orders.reduce((acc, o) => acc + o.Amount, 0);
  switch (activeFormat) {
    case 'Amount':
      return cumulativeAmount.toFixed(2);
    case 'Percentage':
      const totalAmount = allOrders.reduce((acc, o) => acc + o.Amount, 0);
      const percentage = (cumulativeAmount / totalAmount) * 100;
      return percentage.toFixed(2) + '%';
    case 'Ratio':
      const totalAmountRatio = allOrders.reduce((acc, o) => acc + o.Amount, 0);
      const ratio = cumulativeAmount / totalAmountRatio;
      return ratio.toFixed(2);
    default:
      return cumulativeAmount.toFixed(2);
  }
};

const calculateRowAmount = (activeFormat: string, amount: number, allOrders: IOpenOrder[]) => {
  switch (activeFormat) {
    case 'Amount':
      return amount.toFixed(2);
    case 'Percentage':
      const totalAmount = allOrders.reduce((acc, o) => acc + o.Amount, 0);
      const percentage = (amount / totalAmount) * 100;
      return percentage.toFixed(2) + '%';
    case 'Ratio':
      const totalAmountRatio = allOrders.reduce((acc, o) => acc + o.Amount, 0);
      const ratio = amount / totalAmountRatio;
      return ratio.toFixed(2);
    default:
      return amount.toFixed(2);
  }
};

const calculateRowPrice = (activeFormat: string, price: number, currentPrice?: number) => {
  if (!currentPrice) return price.toString();
  switch (activeFormat) {
    case 'Amount':
      return price.toString();
    case 'Percentage':
      const percentage = ((price - currentPrice) / currentPrice) * 100;
      return percentage.toFixed(4) + '%';
    case 'Ratio':
      const ratio = price / currentPrice;
      return ratio.toFixed(4);
    default:
      return price.toString();
  }
};

const calculateRowTotal = (price: number, amount: number, symbol?: string) => {
  return (price * amount).toFixed(2) + ' ' + (symbol ? symbol : '');
};

const ControlPanel = () => {
  const param = useParams();
  const location = useLocation();

  const [cancelOrderRequest] = useCancelOrderMutation();
  const [cancelOrdersRequest] = useCancelOrdersMutation();

  const accessValueId = location.state?.accessValueId;

  const {
    data: balanceData,
    refetch: refreshBalance,
    startedTimeStamp: balanceStartedTimeStamp,
  } = useGetBalanceQuery(accessValueId ? { id: accessValueId } : skipToken);

  const {
    data: priceData,
    refetch: refreshPrice,
    startedTimeStamp: priceStartedTimeStamp,
  } = useGetPriceQuery(param.userId && param.pairSymbol ? { id: param.userId, symbol: param.pairSymbol } : skipToken);

  const {
    data: myOpenOrders,
    refetch: refreshOpenOrders,
    startedTimeStamp: openOrdersStartedTimeStamp,
  } = useGetMyOpenOrderQuery(accessValueId && param.pairSymbol ? { id: accessValueId, symbol: param.pairSymbol } : skipToken);

  const feesState = useSelector((state: AppState) => state.fees);

  const [greenOrders, setGreenOrders] = useState<IOpenOrder[]>([]);
  const [redOrders, setRedOrders] = useState<IOpenOrder[]>([]);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelOrder, setIsCancelOrder] = useState<IOpenOrder | null>(null);

  const [isCancelAllDialogOpen, setIsCancelAllDialogOpen] = useState(false);
  const [isMakeNewOrderDialogOpen, setIsMakeNewOrderDialogOpen] = useState(false);

  const activeStrategyId = location.state?.activeStrategyId;
  const strategyType = location.state?.strategyType;

  const dispatch = useAppDispatch();
  const [showConfirm, setShowConfirm] = useState<boolean>();

  const { setConfirmMessage } = confirmSlice.actions;

  const [dailyFee, setFeePerDay] = useState<number>(feesState.dailyFees[activeStrategyId]);
  const [takerFee, setTakerFee] = useState<number>(feesState.strategyFees[activeStrategyId]?.takerFee ?? 'NULL');
  const [makerFee, setMakerFee] = useState<number>(feesState.strategyFees[activeStrategyId]?.makerFee ?? 'NULL');

  const [now, setNow] = useState(new Date());
  const { handleModal } = useContext(ModalContext);

  const [activeFormat, setActiveFormat] = useState<'Ratio' | 'Amount' | 'Percentage' | string>('Amount');

  const buySymbol = useMemo(() => {
    if (!balanceData) return;
    if (balanceData.length === 0) return;
    const data = balanceData.find((item) => item.Type === 'BuySymbol');
    if (!data) return;
    return data.Name;
  }, [balanceData]);

  const cancelOrder = async (userId: number | string, symbol: string, orderId: string) => {
    try {
      const res = await cancelOrderRequest({
        id: userId,
        symbol: symbol,
        orderId: orderId,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const refetchOpenOrders = async () => {
    await refreshOpenOrders();
  };

  useEffect(() => {}, [feesState]);

  useEffect(() => {
    if (myOpenOrders) {
      const greenOrders = myOpenOrders.OpenOrders.filter((item) => item.Side === 0).sort((a, b) => b.Price - a.Price); // sort by price desc
      const redOrders = myOpenOrders.OpenOrders.filter((item) => item.Side === 1).sort((a, b) => a.Price - b.Price); // sort by price asc
      setGreenOrders(greenOrders);
      setRedOrders(redOrders);
    }
  }, [myOpenOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderCancellation = async (orderId: string) => {
    const order = myOpenOrders?.OpenOrders.find((o) => o.Id === orderId);
    if (!order) return;
    setIsCancelDialogOpen(true);
    setIsCancelOrder(order);
  };

  const handleCancelConfirm = async (order: IOpenOrder) => {
    // await refetch();
    try {
      if (!param.userId) return;
      await cancelOrder(accessValueId, order.Symbol, order.Id);
      await refreshOpenOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmed = async () => {
    try {
      if (!accessValueId) return;
      if (!myOpenOrders?.OpenOrders[0]?.Symbol) return;

      await cancelOrdersRequest({
        id: accessValueId,
        symbol: myOpenOrders?.OpenOrders[0]?.Symbol,
      }).unwrap();

      refetchOpenOrders();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="d-flex ml-2">
      <div className="flex flex-col w-1/6 h-screen mr-2">
        <div className="flex flex-col space-y-1 mb-8">
          <div className="flex flex-row justify-between">
            <div>Balance</div>
            <div className="text-xs">
              {balanceStartedTimeStamp && getTimeDifferenceShortString(new Date(balanceStartedTimeStamp), now)}
            </div>
          </div>
          {balanceData?.map((item) => (
            <input key={item.Name} type="text" value={item.Value.toFixed(4) + ' ' + item.Name} className="p-1" disabled />
          ))}
        </div>
        <div className="flex flex-col space-y-1 mb-8">
          <div className="flex flex-row justify-between">
            <div>Ask Price</div>
            <div className="text-xs">
              {priceStartedTimeStamp && getTimeDifferenceShortString(new Date(priceStartedTimeStamp), now)}
            </div>
          </div>
          {priceData?.AskPrice && (
            <input type="text" value={priceData?.AskPrice.toString() + ' ' + buySymbol} className="p-1" disabled />
          )}
          <div>Bid Price</div>
          {priceData?.BidPrice && (
            <input type="text" value={priceData?.BidPrice.toString() + ' ' + buySymbol} className="p-1" disabled />
          )}
        </div>
        {strategyType === 2 ? (
          <div>
            <div className="flex flex-col space-y-1">
              <div className="flex flex-row justify-between">
                <div>Actual Maker Fee</div>
                <div className="text-xs">
                  {priceStartedTimeStamp && getTimeDifferenceShortString(new Date(priceStartedTimeStamp), now)}
                </div>
              </div>
              <div>
                <div className="input-group mb-3">
                  <span className="input-group-text">%</span>
                  <span className="input-group-text">{makerFee ?? 'NULL'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <div className="flex flex-row justify-between">
                <div>Actual Taker Fee</div>
                <div className="text-xs">
                  {priceStartedTimeStamp && getTimeDifferenceShortString(new Date(priceStartedTimeStamp), now)}
                </div>
              </div>
              <div>
                <div className="input-group mb-3">
                  <span className="input-group-text">%</span>
                  <span className="input-group-text">{takerFee ?? 'NULL'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-1 mb-8">
              <div className="flex flex-row justify-between">
                <div>Calculated daily fee</div>
                <div className="text-xs">
                  {priceStartedTimeStamp && getTimeDifferenceShortString(new Date(priceStartedTimeStamp), now)}
                </div>
              </div>
              <div>
                <div className="input-group mb-3">
                  <span className="input-group-text">$</span>
                  <span className="input-group-text">{dailyFee ? dailyFee.toFixed(1) : 'NULL'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <Button
          styleBtn={'btn btn-primary btn-md'}
          onClick={() =>
            handleModal(
              'Making a new order',
              <MakeNewOrderDialog
                symbol={`${param.pairSymbol}`}
                userId={accessValueId as string}
                refetchOpenOrders={refetchOpenOrders}
              />,
            )
          }>
          Make New Order
        </Button>
      </div>
      <div className="flex flex-col justify-start w-4/6 h-screen">
        <div className="text-xs -mb-8 text-right">
          {openOrdersStartedTimeStamp && getTimeDifferenceShortString(new Date(openOrdersStartedTimeStamp), now)}
        </div>
        <div className="h-auto">
          {myOpenOrders?.OpenOrders && <OpenOrdersChart greenOrders={greenOrders} redOrders={redOrders} />}
        </div>
        <div className="m-2 flex flex-row-reverse">
          <Dropdown active={activeFormat} setActive={setActiveFormat} />
        </div>
        <div className="flex">
          <div className="w-1/2">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {greenColumns.map((column, index) => (
                    <th scope="col" className="py-1 px-2 text-center" key={index}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {greenOrders &&
                  greenOrders.map((row, i, allOrders) => (
                    <OpenOrdersRow
                      orderId={row.Id}
                      amount={calculateRowAmount(activeFormat, row.Amount, allOrders)}
                      price={calculateRowPrice(activeFormat, row.Price, priceData?.AskPrice)}
                      total={calculateRowTotal(row.Price, row.Amount, buySymbol)}
                      cumulativeAmount={calculateCumulativeAmount(activeFormat, row, allOrders)}
                      key={row.Id}
                      index={i}
                      isSellOrder={!!row.Side}
                      buySymbol={buySymbol}
                      handleOrderCancellation={handleOrderCancellation}
                    />
                  ))}
              </tbody>
            </table>
          </div>
          <div className="w-1/2">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {redColumns.map((column, index) => (
                    <th scope="col" className="py-1 px-2 text-center" key={index}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {redOrders &&
                  redOrders.map((row, i, allOrders) => (
                    <OpenOrdersRow
                      orderId={row.Id}
                      amount={calculateRowAmount(activeFormat, row.Amount, allOrders)}
                      price={calculateRowPrice(activeFormat, row.Price, priceData?.AskPrice)}
                      total={calculateRowTotal(row.Price, row.Amount, buySymbol)}
                      cumulativeAmount={calculateCumulativeAmount(activeFormat, row, allOrders)}
                      key={row.Id}
                      index={i}
                      isSellOrder={!!row.Side}
                      buySymbol={buySymbol}
                      handleOrderCancellation={handleOrderCancellation}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-1/6 h-screen">
        <Button styleBtn={'btn btn-primary btn-md mt-6 ml-2 mr-2'} onClick={() => refreshOpenOrders()}>
          Refresh Open Orders
        </Button>
        <Button styleBtn={'btn btn-primary btn-md mt-6 ml-2 mr-2'} onClick={() => refreshPrice()}>
          Refresh Price
        </Button>
        <Button styleBtn={'btn btn-primary btn-md mt-6 ml-2 mr-2'} onClick={() => refreshBalance()}>
          Refresh Balance
        </Button>
        <Button
          styleBtn={'btn btn-primary btn-md mt-6 ml-2 mr-2'}
          onClick={() => {
            dispatch(setConfirmMessage('Are you sure to delete all the orders?'));
            setShowConfirm(!showConfirm);
          }}>
          Cancel All Orders
        </Button>
      </div>
      <CancelAllOrdersDialog
        isOpen={isCancelAllDialogOpen}
        closeDialog={() => setIsCancelAllDialogOpen(false)}
        userId={accessValueId}
        symbol={myOpenOrders?.OpenOrders[0]?.Symbol}
        refetchData={refetchOpenOrders}
      />
      <CancelDialog
        isOpen={isCancelDialogOpen}
        closeDialog={() => setIsCancelDialogOpen(false)}
        orderInfo={isCancelOrder}
        buySymbol={buySymbol}
        handleCancelClick={handleCancelConfirm}
      />
      {showConfirm && (
        <CustomConfirm
          onConfirm={handleConfirmed}
          setShowModal={setShowConfirm}
          showConfirm={showConfirm}
          deleteButtonText="Confirm"
          cancelButtonText="Cancel"
        />
      )}
    </div>
  );
};

export default ControlPanel;
