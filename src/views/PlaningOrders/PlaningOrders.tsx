import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import PlanningOrdersRow from './PlaningOrdersRow';
import { useNavigate } from 'react-router-dom';
import PlanningOrdersChart from '../../components/Charts/BookChart';
import { getChartData } from './utils';
import { useGetPlaningOrderQuery } from '../../api/api-planning-orders';
import { useUpdatePlanningOrdersMutation, useDeletePlanningOrdersMutation } from '../../api/api-planning-orders';
import Dropdown from './Dropdown/Dropdown';
import { Spinner } from '../../components/Spinner';
import { ModalContext } from '../../contexts/ModalProvider/ModalProvider';
import BalanceModal from '../ActiveStrategy/Modals/BalanceModal';
import Button from '../Button/Button';
import AddNewOrderModal from './Modals/AddNewOrderModal';
import { IChartData } from '../../models/interfaces/IChartData';
import AddNewRangeOrdersModal from './Modals/AddNewRangeOrdersModal';
import CustomConfirm from '../CustomConfirm/CustomConfirm';
import { confirmSlice } from '../../redux/confirm-slice';
import { useAppSelector, useAppDispatch } from '../../redux/redux';
import { alertMessageSlice } from '../../redux/alert-slice';
import { IActiveStrategy } from '../ActiveStrategy/ActiveStrategy';

export interface IParams {
  userId: string;
  activeStrategyId: string;
}

const greenColumns = ['№', 'Price Ratio', 'Amount Ratio', 'Sum', 'Controls'];
const redColumns = ['№', 'Price Ratio', 'Amount Ratio', 'Sum', 'Amount USDT', 'Sum USDT', 'Controls'];

export interface IPlaningOrders {
  Id: number;
  ActiveStrategyId: number;
  PriceRatio: number;
  AmountRatio: number;
  AmountAdjust: number;
  AmountDecimal: number;
  AmountRandomDelta: number;
  PriceAdjust: number;
  PriceDecimal: number;
  ActiveStrategy: IActiveStrategy;
  TokensAmount: number;
  IsToBuyTokens: number;
}

const PlaningOrders = () => {
  const [chartData, setChartData] = useState<IChartData[]>([]);
  const [isEditButtonDisabled, setIsEditButtonDisabled] = useState<boolean>(true);
  const [showConfirm, setShowConfirm] = useState<boolean>();
  const { activeStrategyId } = useParams<keyof IParams>() as IParams;
  const navigate = useNavigate();
  const { userId } = useParams();
  const { setConfirmMessage } = confirmSlice.actions;
  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);
  const { setShowAlert, setAlertMessage } = alertMessageSlice.actions;
  const dispatch = useAppDispatch();
  const [updatePlanningOrders, { isLoading, isError, isSuccess }] = useUpdatePlanningOrdersMutation();
  const [deletePlanningOrders] = useDeletePlanningOrdersMutation();
  const [activeDropdown, setActiveDropdown] = useState<string>('Ratio');
  const {
    data: planingOrderData,
    isLoading: isPlaningOrderLoading,
    refetch,
  } = useGetPlaningOrderQuery({
    activeStrategyId,
    userId: userId as string | number,
  });
  const { handleModal } = useContext(ModalContext);
  const { state } = useLocation() as any;

  const data = useMemo(() => {
    if (planingOrderData) {
      const sortOrders = [...planingOrderData];
      const result = getChartData(sortOrders.sort((a, b) => a.PriceRatio - b.PriceRatio));
      setChartData(result);
      return result;
    }
  }, [planingOrderData]);

  useEffect(() => {
    if (!planingOrderData) {
      return;
    }
    const checkData = chartData.map((item) => {
      return { ...item, sum: undefined };
    });
    const planingOrder = [...planingOrderData];
    if (
      JSON.stringify(planingOrder.sort((a, b) => a.PriceRatio - b.PriceRatio)) ===
      JSON.stringify(checkData.sort((a, b) => a.PriceRatio - b.PriceRatio))
    ) {
      setIsEditButtonDisabled(true);
    } else {
      setIsEditButtonDisabled(false);
    }
  }, [planingOrderData, chartData]);

  const multipleEdit = async () => {
    try {
      let downloadData = chartData.map((item) => {
        delete item.sum;
        return { ...item };
      });

      await updatePlanningOrders({
        id: +activeStrategyId,
        userId: userId as string | number,
        body: downloadData,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isError) {
      dispatch(setAlertMessage('Something went wrong'));
      dispatch(setShowAlert(!showAlert));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(setAlertMessage('Success!'));
      dispatch(setShowAlert(!showAlert));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const removeAll = () => {
    if (chartData.length > 0) {
      setShowConfirm(!showConfirm);
      dispatch(setConfirmMessage('Are you sure to delete everything?'));
    } else {
      dispatch(setAlertMessage('This strategy does not have any orders'));
      dispatch(setShowAlert(!showAlert));
    }
  };

  const handleConfirmed = () => {
    setChartData([]);
    deleteAllPlanningOrdersInStrategy();
  };

  const deleteAllPlanningOrdersInStrategy = async () => {
    try {
      await deletePlanningOrders({
        planningOrderId: null,
        activeStrategyId: +activeStrategyId,
        userId: userId as string | number,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    // chartData &&
    //   state.balance &&
    //checkUSDTlower(chartData, state.balance) &&
    //handleModal(<WarningMessage text={`${planingOrderData?.[0].ActiveStrategy.BuySymbol} lower then 5`} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.balance, chartData]);

  const clearFilter = () => {
    setActiveDropdown('Ratio');
  };

  return (
    <div className="max-w-[1180px] m-auto px-2">
      {isPlaningOrderLoading ? (
        <div className="rounded border border-sky-900/10 bg-sky-50 p-6 text-sky-700 mx-auto w-fit flex flex-col items-center">
          <Spinner />
        </div>
      ) : !data?.length ? (
        <div className="rounded border border-sky-900/10 bg-sky-50 p-6 text-sky-700 mx-auto w-fit flex flex-col items-center">
          <strong className="text-sm font-medium">No Data.</strong>
          <Button styleBtn={'btn btn-primary btn-md'} onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <div className="flex flex-wrap">
            {planingOrderData && planingOrderData?.[0].ActiveStrategy.StrategyType === 1 && isLoading ? (
              <div className="flex justify-center items-center w-full h-[400px]">
                <Spinner />
              </div>
            ) : (
              <PlanningOrdersChart
                chartData={chartData}
                filter={activeDropdown}
                balance={state.balance}
                buySymbol={planingOrderData?.[0].ActiveStrategy.BuySymbol}
              />
            )}
          </div>
          <div className="max-w-[1180px] px-16 pb-8 flex items-center justify-between">
            <div>
              <Button
                styleBtn="btn btn-primary mr-4"
                onClick={() =>
                  handleModal(
                    'Adding new order',
                    <AddNewOrderModal
                      addNewOrdersToList={refetch}
                      setChartData={setChartData}
                      chartData={chartData}
                      userId={userId as string | number}
                    />,
                  )
                }>
                Add new
              </Button>
              <Button
                styleBtn="btn btn-primary mr-4"
                onClick={() =>
                  handleModal(
                    'Adding new orders range',
                    <AddNewRangeOrdersModal
                      addNewOrdersToList={refetch}
                      setChartData={setChartData}
                      chartData={chartData}
                      userId={userId as string | number}
                    />,
                  )
                }>
                Add Range
              </Button>
              <Button
                styleBtn="btn btn-danger mr-4"
                onClick={() => {
                  removeAll();
                }}>
                Delete All
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
              <Button
                styleBtn="btn btn-primary"
                onClick={() =>
                  handleModal(
                    'Balance',
                    <BalanceModal
                      balance={state.balance}
                      SellSymbol={state.SellSymbol || ''}
                      strategyType={chartData[0]?.ActiveStrategy?.StrategyType}
                      isLoading={isLoading}
                      decimals={chartData[0].AmountDecimal || 2}
                    />,
                  )
                }>
                Balance
              </Button>
            </div>
            <div>
              <Dropdown active={activeDropdown} setActive={setActiveDropdown} />
              <Button styleBtn="btn btn-primary mt-2" disabled={/* isEditButtonDisabled */ false} onClick={() => multipleEdit()}>
                Save All
              </Button>
            </div>
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
                  {planingOrderData &&
                    chartData.map(
                      (row, i) =>
                        row.PriceRatio < 1 && (
                          <PlanningOrdersRow
                            row={row}
                            key={i}
                            index={i}
                            filter={activeDropdown}
                            clearFilter={clearFilter}
                            chartData={chartData}
                            setChartData={setChartData}
                            isMultipleLoading={isLoading}
                            balance={state.balance}
                            userId={userId as string | number}
                          />
                        ),
                    )}
                </tbody>
              </table>
            </div>
            <div className="w-1/2">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    {redColumns.map((column, index) =>
                      activeDropdown !== 'Amounts' && (column === 'Amount USDT' || column === 'Sum USDT') ? null : (
                        <th scope="col" className="py-1 px-2 text-center" key={index}>
                          {column}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {planingOrderData &&
                    chartData.map(
                      (row, i) =>
                        row.PriceRatio >= 1 && (
                          <PlanningOrdersRow
                            row={row}
                            key={i}
                            index={i}
                            filter={activeDropdown}
                            clearFilter={clearFilter}
                            chartData={chartData}
                            setChartData={setChartData}
                            isMultipleLoading={isLoading}
                            balance={state.balance}
                            userId={userId as string | number}
                          />
                        ),
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaningOrders;
