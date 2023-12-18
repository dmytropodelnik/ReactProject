import { useEffect, useState } from 'react';
import { IChartData } from '../../models/interfaces/IChartData';
import { NumericFormat } from 'react-number-format';
import { getChartData, getTableAmount, getTableAmountUSDT, getTablePriceRatio } from './utils';
import { useDeletePlanningOrdersMutation } from '../../api/api-planning-orders';
import IChartBalance from '../../models/interfaces/IChartBalance';
import Button from '../Button/Button';
import { useAppDispatch } from '../../redux/redux';
import { confirmSlice } from '../../redux/confirm-slice';
import CustomConfirm from '../CustomConfirm/CustomConfirm';

const PlanningOrdersRow = ({
  row,
  index,
  chartData,
  filter,
  clearFilter,
  balance,
  setChartData,
  isMultipleLoading,
  userId,
}: {
  row: IChartData;
  index: number;
  filter: string;
  clearFilter: Function;
  balance: IChartBalance;
  chartData: IChartData[];
  setChartData: Function;
  isMultipleLoading: boolean;
  userId: string | number;
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>();
  const [priceRatio, setPriceRatio] = useState<number>(row.PriceRatio);
  const [amountRatio, setAmountRatio] = useState<number>(row.AmountRatio);

  const { setConfirmMessage } = confirmSlice.actions;

  const [deletePlanningOrders] = useDeletePlanningOrdersMutation();
  const dispatch = useAppDispatch();

  const removePlanningOrder = () => {
    setShowConfirm(!showConfirm);
    dispatch(setConfirmMessage('Are you sure to delete everything?'));
  };

  const handleConfirmed = () => {
    const newData = [...chartData];
    newData.splice(index, 1);
    setChartData(newData);
    deletePlanningOrderInStrategy();
  };

  const deletePlanningOrderInStrategy = async () => {
    try {
      await deletePlanningOrders({
        planningOrderId: row.Id.toString(),
        activeStrategyId: null,
        userId,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const editPlaningOrder = () => {
    clearFilter();
    if (!isEditMode) return setIsEditMode(true);
    const newChartData = [...chartData];
    newChartData[index] = {
      ...newChartData[index],
      AmountRatio: amountRatio,
      PriceRatio: priceRatio,
    };
    const result = getChartData(newChartData.sort((a, b) => a.PriceRatio - b.PriceRatio));
    setChartData(result);
    setIsEditMode(false);
  };

  useEffect(() => {
    if (isMultipleLoading) {
      setIsEditMode(false);
    }
  }, [isMultipleLoading]);

  useEffect(() => {
    setAmountRatio(row.AmountRatio);
    setPriceRatio(row.PriceRatio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  return (
    <>
      <tr className={`${row.PriceRatio < 1 ? 'bg-green-100' : 'bg-red-100'} border-b hover:bg-gray-50`}>
        <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">{index + 1}</td>
        <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">
          {isEditMode ? (
            <NumericFormat
              className="form-control"
              value={priceRatio}
              decimalSeparator="."
              allowLeadingZeros={false}
              onChange={(e) => {
                setPriceRatio(Number(e.target.value));
              }}
            />
          ) : (
            getTablePriceRatio(priceRatio, filter, row.PriceDecimal || 4, balance.price)
          )}
        </td>
        <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">
          {isEditMode ? (
            <NumericFormat
              className="form-control"
              value={amountRatio}
              decimalSeparator="."
              onChange={(e) => {
                setAmountRatio(Number(e.target.value));
              }}
            />
          ) : (
            getTableAmount(
              amountRatio,
              filter,
              row.AmountDecimal || 4,
              priceRatio < 1 ? balance.BuyTotal : balance.SellTotal,
              priceRatio < 1 ? row.ActiveStrategy?.BuySymbol : row.ActiveStrategy?.SellSymbol,
            )
          )}
        </td>
        <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">
          {row.sum &&
            getTableAmount(
              row.sum,
              filter,
              row.AmountDecimal || 4,
              priceRatio < 1 ? balance.BuyTotal : balance.SellTotal,
              priceRatio < 1 ? row.ActiveStrategy?.BuySymbol : row.ActiveStrategy?.SellSymbol,
            )}
        </td>
        {priceRatio >= 1 && filter === 'Amounts' && (
          <>
            <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">
              {getTableAmountUSDT(amountRatio, priceRatio, balance, row.AmountDecimal || 4, row.ActiveStrategy.BuySymbol)}
            </td>
            <td className=" text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap ">
              {row.sum && getTableAmountUSDT(row.sum, priceRatio, balance, row.AmountDecimal || 4, row.ActiveStrategy.BuySymbol)}
            </td>
          </>
        )}
        <td style={{ minWidth: '140px' }} className="text-center">
          <Button styleBtn={'btn btn-primary mr-2'} onClick={() => editPlaningOrder()}>
            {isEditMode ? 'Save' : 'Edit'}
          </Button>
          <Button styleBtn={'btn btn-danger'} onClick={() => removePlanningOrder()}>
            Delete
          </Button>
        </td>
      </tr>
      {showConfirm && (
        <CustomConfirm
          onConfirm={handleConfirmed}
          setShowModal={setShowConfirm}
          showConfirm={showConfirm}
          deleteButtonText="Delete"
          cancelButtonText="Cancel"
        />
      )}
    </>
  );
};

export default PlanningOrdersRow;
