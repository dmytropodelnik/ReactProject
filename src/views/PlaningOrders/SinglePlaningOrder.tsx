import { useContext, useEffect, useState, Suspense, lazy } from 'react';
import { NumericFormat } from 'react-number-format';
import { CustomAlert } from '../CustomAlert/CustomAlert';
import { Spinner } from '../../components/Spinner';
import { ModalContext } from '../../contexts/ModalProvider/ModalProvider';
import { useUpdateActiveStrategyMutation } from '../../api/api-active-strategies';
import { useGetPlaningOrderQuery, useUpdatePlanningOrdersMutation } from '../../api/api-planning-orders';
import { IActiveStrategy } from '../ActiveStrategy/ActiveStrategy';
import { simulation } from './utils';
import IAccessValue from '../../models/interfaces/IAccessValue';
import Button from '../Button/Button';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../redux/redux';
import { setAlertMessage, setShowAlert } from '../../redux/alert-slice';

const TradeChart = lazy(() => import('../../components/Charts/TradeChart'));

const activeStrategyTitles = [
  'Start time',
  'Finish time',
  'Buy symbol',
  'Sell symbol',
  'Pair symbol',
  'Buy access value',
  'Sell access value',
  'User',
  'Strategy type',
  'Time delay',
  'Time random delta',
  'Multiplayer',
  'Invokes amount',
  'Enabled time',
];

const planingOrderTitles = [
  'Active strategy id',
  'Price ratio',
  'Amount ratio',
  'Amount adjust',
  'Amount random delta',
  'Price adjust',
  'Price decimal',
  'Amount decimal',
  'Tokens amount',
  'Is to buy tokens',
];

const SinglePlaningOrder = ({
  activeStrategy,
  accessValuesArray,
}: {
  activeStrategy: IActiveStrategy;
  accessValuesArray: IAccessValue[];
}) => {
  /// active strategy data
  const [isActiveStrategyEditMode, setActiveStrategyEditMode] = useState<boolean>(false);
  const [timeDelay, setTimeDelay] = useState<number>(activeStrategy.TimeDelay);
  const [strategyType, setStrategyType] = useState<number>(activeStrategy.StrategyType);
  const [buyAccessValueId, setBuyAccessValueId] = useState<string>(activeStrategy.BuyAccessValueId.toString());
  const [sellAccessValueId, setSellAccessValueId] = useState<string>(activeStrategy.SellAccessValueId.toString());
  const [startTime, setStartTime] = useState<string>(activeStrategy.StartTime);
  const [finishTime, setFinishTime] = useState<string>(activeStrategy.FinishTime);
  const [timeRandomDelta, setTimeRandomDelta] = useState<number>(activeStrategy.TimeRandomDelta || 0);
  const [multiplayer, setMultiplayer] = useState<number>(activeStrategy.Multiplayer || 0);
  const [invokesAmount, setInvokesAmount] = useState<number>(activeStrategy.InvokesAmount || 0);

  /// planing order data
  const [isPlaningOrderEditMode, setPlanningOrderEditMode] = useState<boolean>(false);
  const [planingOrderId, setPlaningOrderId] = useState<number>(0);
  const [activeStrategyId, setActiveStrategyId] = useState<number>(activeStrategy.Id);
  const [priceRatio, setPriceRatio] = useState<number>(0);
  const [amountRatio, setAmountRatio] = useState<number>(0);
  const [amountRandomDelta, setAmountRandomDelta] = useState<number>(0);
  const [amountAdjust, setAmountAdjust] = useState<number>(0);
  const [priceAdjust, setPriceAdjust] = useState<number>(0);
  const [amountDecimal, setAmountDecimal] = useState<number>(0);
  const [priceDecimal, setPriceDecimal] = useState<number>(0);
  const [tokensAmount, setTokensAmount] = useState<number>(0);
  const [isToBuyTokens, setIsToBuyTokens] = useState<number>(0);

  const { userId } = useParams();

  // other
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(0);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [chartData, setChartData] = useState<number[]>([]);
  const [updatePlanningOrders, { isLoading, isError, isSuccess }] = useUpdatePlanningOrdersMutation();
  const [updateActiveStrategy, { isLoading: isLoadingASPUT, isError: isErrorASPUT, isSuccess: isSuccessASPUT }] =
    useUpdateActiveStrategyMutation();
  let { handleModal } = useContext(ModalContext);
  const { data, isLoading: isPlaningOrderLoading } = useGetPlaningOrderQuery({
    activeStrategyId,
    userId: userId as string | number,
  });

  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);

  useEffect(() => {
    setInitialDataToPlanningOrder();
  }, [data]);

  const setInitialDataToPlanningOrder = () => {
    if (data && data.length > 0) {
      setAmountAdjust(data[0].AmountAdjust);
      setAmountRandomDelta(data[0].AmountRandomDelta);
      setPriceAdjust(data[0].PriceAdjust);
      setAmountDecimal(data[0].AmountDecimal);
      setPriceDecimal(data[0].PriceDecimal);
      setTokensAmount(data[0].TokensAmount);
      setAmountRatio(data[0].AmountRatio);
      setPriceRatio(data[0].PriceRatio);
      setActiveStrategyId(data[0].ActiveStrategyId);
      setPlaningOrderId(data[0].Id);
      setIsToBuyTokens(data[0].IsToBuyTokens);
    }
  };

  const setInitialDataToActiveStrategy = () => {
    if (activeStrategy) {
      setTimeDelay(activeStrategy.TimeDelay);
      setStrategyType(activeStrategy.StrategyType);
      setBuyAccessValueId(activeStrategy.BuyAccessValueId.toString());
      setSellAccessValueId(activeStrategy.SellAccessValueId.toString());
      setStartTime(activeStrategy.StartTime);
      setFinishTime(activeStrategy.FinishTime);
      setTimeRandomDelta(activeStrategy.TimeRandomDelta || 0);
      setMultiplayer(activeStrategy.Multiplayer || 0);
    }
  };

  const cancelPlanningOrderEditing = () => {
    setInitialDataToPlanningOrder();
    setPlanningOrderEditMode(false);
  };

  const cancelActiveStrategyEditing = () => {
    setInitialDataToActiveStrategy();
    setActiveStrategyEditMode(false);
  };

  useEffect(() => {
    setMin(amountAdjust * 60 * 24 * multiplayer);
    setMax(amountRandomDelta * 60 * 24 * multiplayer + amountAdjust * 60 * 24 * multiplayer);
  }, [activeStrategy, amountAdjust, amountRandomDelta, multiplayer]);

  const editPlaningOrders = async () => {
    if (!isPlaningOrderEditMode) return setPlanningOrderEditMode(true);
    if (amountAdjust < 5) {
      dispatch(setAlertMessage('Amount adjust must have a value more than 5'));
      dispatch(setShowAlert(!showAlert));
      return;
    }

    try {
      const body = [
        {
          Id: planingOrderId,
          ActiveStrategyId: activeStrategy.Id,
          // ActiveStrategy: activeStrategy,
          PriceRatio: priceRatio,
          AmountRatio: amountRatio,
          AmountAdjust: amountAdjust,
          AmountRandomDelta: amountRandomDelta,
          PriceAdjust: priceAdjust,
          AmountDecimal: amountDecimal,
          PriceDecimal: priceDecimal,
          TokensAmount: tokensAmount,
          isToBuyTokens: isToBuyTokens,
        },
      ];

      await updatePlanningOrders({
        id: activeStrategy.Id,
        userId: userId as string | number,
        body,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
    setPlanningOrderEditMode(false);
  };

  const editActiveStrategy = async () => {
    if (!isActiveStrategyEditMode) return setActiveStrategyEditMode(true);

    try {
      const body = {
        Id: activeStrategy.Id,
        StartTime: startTime,
        FinishTime: finishTime,
        BuyAccessValueId: buyAccessValueId,
        SellAccessValueId: sellAccessValueId,
        StrategyType: strategyType,
        TimeDelay: timeDelay,
        TimeRandomDelta: timeRandomDelta,
        MultiPlayer: multiplayer,
        InvokesAmount: invokesAmount,
      };

      await updateActiveStrategy({
        activeStrategyId: activeStrategy.Id,
        userId: userId as string | number,
        body,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
    setActiveStrategyEditMode(false);
  };

  useEffect(() => {
    const result = simulation(amountAdjust, amountAdjust + amountRandomDelta, timeRandomDelta);
    if (result) {
      setChartData(result);
      setRefresh(false);
    }
  }, [amountAdjust, amountRandomDelta, timeRandomDelta, refresh]);

  useEffect(() => {
    isError && handleModal('Something went wrong', <CustomAlert message={'Something went wrong'} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  useEffect(() => {
    isSuccess && handleModal('Success', <CustomAlert message={'Success'} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <table className="table">
        <thead>
          <tr className="align-middle">
            {activeStrategyTitles.map((title, index) => (
              <th key={index}>{title ?? 'NULL'}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center">
          <tr>
            <td>
              {isActiveStrategyEditMode ? (
                <input
                  size={35}
                  className="form-control"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                  }}
                />
              ) : (
                <span>{startTime.replace('T', ' ').slice(0, -3)}</span>
              )}
            </td>
            <td>
              {isActiveStrategyEditMode ? (
                <input
                  size={35}
                  className="form-control"
                  value={finishTime}
                  onChange={(e) => {
                    setFinishTime(e.target.value);
                  }}
                />
              ) : (
                <span>{finishTime.replace('T', ' ').slice(0, -3)}</span>
              )}
            </td>
            <td>{activeStrategy.BuySymbol}</td>
            <td>{activeStrategy.SellSymbol}</td>
            <td>{activeStrategy.PairSymbol}</td>
            <td>
              {isActiveStrategyEditMode ? (
                <select
                  className="form-select"
                  value={buyAccessValueId}
                  onChange={(e) => {
                    setBuyAccessValueId(e.target.value);
                  }}>
                  <option>Select</option>
                  {accessValuesArray &&
                    accessValuesArray.map((obj: any, index: any) => (
                      <option key={index} value={obj.Id}>
                        {obj.Name}
                      </option>
                    ))}
                </select>
              ) : (
                <span>{buyAccessValueId}</span>
              )}
            </td>
            <td>
              {isActiveStrategyEditMode ? (
                <select
                  className="form-select"
                  value={sellAccessValueId}
                  onChange={(e) => {
                    setSellAccessValueId(e.target.value);
                  }}>
                  <option>Select</option>
                  {accessValuesArray &&
                    accessValuesArray.map((obj: any, index: any) => (
                      <option key={index} value={obj.Id}>
                        {obj.Name}
                      </option>
                    ))}
                </select>
              ) : (
                <span>{sellAccessValueId}</span>
              )}
            </td>
            <td>{activeStrategy.UserId}</td>
            <td>
              {isActiveStrategyEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '50px' }}
                  value={strategyType}
                  onChange={(e) => {
                    setStrategyType(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{strategyType}</span>
              )}
            </td>
            <td>
              {isActiveStrategyEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '50px' }}
                  value={timeDelay}
                  decimalSeparator="."
                  decimalScale={5}
                  onChange={(e) => {
                    setTimeDelay(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{timeDelay}</span>
              )}
            </td>
            <td>
              {isActiveStrategyEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '50px' }}
                  value={timeRandomDelta}
                  decimalSeparator="."
                  decimalScale={5}
                  onChange={(e) => {
                    setTimeRandomDelta(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{timeRandomDelta}</span>
              )}
            </td>
            <td>
              {isActiveStrategyEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '50px' }}
                  value={multiplayer}
                  onChange={(e) => {
                    setMultiplayer(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{multiplayer == 1 ? 'True' : 'False'}</span>
              )}
            </td>
            <td>
              {isActiveStrategyEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '50px' }}
                  value={invokesAmount}
                  onChange={(e) => {
                    setInvokesAmount(+e.target.value);
                  }}
                />
              ) : (
                <span>{invokesAmount}</span>
              )}
            </td>
            <td>
              <span>{activeStrategy?.EnabledTime?.replace('T', ' ').slice(0, -8) ?? 'NULL'}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="d-flex flex-row-reverse">
        {isActiveStrategyEditMode ? (
          <Button styleBtn={'btn btn-primary btn-md ml-2'} onClick={() => cancelActiveStrategyEditing()}>
            Cancel
          </Button>
        ) : (
          ''
        )}
        <Button styleBtn={'btn btn-primary btn-md'} disabled={isLoading} onClick={() => editActiveStrategy()}>
          {isLoading ? '...' : isActiveStrategyEditMode ? 'Save' : 'Edit'}
        </Button>
      </div>

      <table className="table">
        <thead>
          <tr className="align-middle">
            {planingOrderTitles.map((title, index) => (
              <th key={index}>{title ?? 'NULL'}</th>
            ))}
            {activeStrategy.StrategyType === 2 ? <th>Daily volume</th> : null}
          </tr>
        </thead>
        <tbody className="text-center">
          <tr>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '50px' }}
                  value={activeStrategyId}
                  onChange={(e) => {
                    setActiveStrategyId(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{activeStrategyId}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '100px' }}
                  value={priceRatio}
                  onChange={(e) => {
                    setPriceRatio(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{priceRatio}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '100px' }}
                  value={amountRatio}
                  onChange={(e) => {
                    setAmountRatio(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{amountRatio}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '50px' }}
                  value={amountAdjust}
                  onChange={(e) => {
                    setAmountAdjust(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{amountAdjust}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '50px' }}
                  value={amountRandomDelta}
                  onChange={(e) => {
                    setAmountRandomDelta(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{amountRandomDelta}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '100px' }}
                  value={priceAdjust}
                  onChange={(e) => {
                    setPriceAdjust(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{priceAdjust}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '40px' }}
                  value={priceDecimal}
                  onChange={(e) => {
                    setPriceDecimal(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{priceDecimal}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '40px' }}
                  value={amountDecimal}
                  onChange={(e) => {
                    setAmountDecimal(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{amountDecimal}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '100px' }}
                  value={tokensAmount}
                  onChange={(e) => {
                    setTokensAmount(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{tokensAmount}</span>
              )}
            </td>
            <td>
              {isPlaningOrderEditMode ? (
                <NumericFormat
                  className="form-control"
                  style={{ width: '100px' }}
                  value={+isToBuyTokens}
                  onChange={(e) => {
                    setIsToBuyTokens(+e.target.value);
                  }}
                />
              ) : (
                <span>{isToBuyTokens == 1 ? 'True' : 'False'}</span>
              )}
            </td>
            {activeStrategy.StrategyType === 2 ? (
              <td>
                <span>{((amountAdjust + amountRandomDelta / 2) * 60 * 24).toFixed(1)}</span>
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>
      <div className="d-flex flex-row-reverse">
        {isPlaningOrderEditMode ? (
          <Button styleBtn={'btn btn-primary btn-md ml-2'} onClick={() => cancelPlanningOrderEditing()}>
            Cancel
          </Button>
        ) : (
          ''
        )}
        <Button styleBtn={'btn btn-primary btn-md'} disabled={isLoading} onClick={() => editPlaningOrders()}>
          {isLoading ? '...' : isPlaningOrderEditMode ? 'Save' : 'Edit'}
        </Button>
      </div>

      {isPlaningOrderLoading ? (
        <div className="max-w-[1180px] m-auto px-2 flex items-center justify-center h-[300px]">
          <div className="p-4 border rounded text-sky-700 bg-sky-50 border-sky-900/10 flex items-center" role="alert">
            <Spinner />
            <strong className="text-sm font-medium">Loading...</strong>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <Suspense
            fallback={
              <div className="max-w-[1180px] m-auto px-2 flex items-center justify-center h-[300px]">
                <div className="p-4 border rounded text-sky-700 bg-sky-50 border-sky-900/10 flex items-center" role="alert">
                  <Spinner />
                  <strong className="text-sm font-medium">Loading...</strong>
                </div>
              </div>
            }>
            <TradeChart chartData={chartData} />
          </Suspense>
          <div>
            <Button styleBtn={'btn btn-primary btn-md ml-2 mr-2'} onClick={() => setRefresh(true)}>
              Refresh
            </Button>
          </div>
        </div>
      )}
      {showAlert ? <CustomAlert message={errorMessage} /> : null}
    </>
  );
};

export default SinglePlaningOrder;
function dispatch(arg0: any) {
  throw new Error('Function not implemented.');
}

