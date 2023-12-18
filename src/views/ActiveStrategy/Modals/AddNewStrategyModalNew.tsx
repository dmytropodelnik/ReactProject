import React, { useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useCreateCategoryMutation } from '../../../api/api-active-strategies';
import { useCreatePlanningOrdersMutation } from '../../../api/api-planning-orders';
import IAccessValue from '../../../models/interfaces/IAccessValue';
import { useAppSelector, useAppDispatch } from '../../../redux/redux';
import { alertMessageSlice } from '../../../redux/alert-slice';
import { ModalContext } from '../../../contexts/ModalProvider/ModalProvider';

export interface IAddNewStrategyModalProps {
  refetchActiveStrategies: () => Promise<void>;
  accessValuesArray: IAccessValue[];
  userId: string | number;
  sellSymbol: string;
}

const AddNewStrategyModalNew: React.FC<IAddNewStrategyModalProps> = ({
  refetchActiveStrategies,
  accessValuesArray,
  userId,
  sellSymbol,
}) => {
  const BUY_SYMBOL = 'USDT';

  const [buyAccessValueId, setBuyAccessValueId] = useState<string>();
  const [sellAccessValueId, setSellAccessValueId] = useState<string>();
  const [finishTime, setFinishTime] = useState<string>('');
  const [buySymbol, setBuySymbol] = useState<string>(BUY_SYMBOL);
  const [pairSymbol, setPairSymbol] = useState<string>(sellSymbol + '-' + buySymbol);
  const [type, setType] = useState<number>(1);
  const [multiplayer, setMultiplayer] = useState<boolean>(false);
  const [timeRandomDelta, setTimeRandomDelta] = useState<number>(0);
  const [timeDelay, setTimeDelay] = useState<number>(0);
  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);
  const { setShowAlert, setAlertMessage } = alertMessageSlice.actions;
  const dispatch = useAppDispatch();
  const [invokesAmount, setInvokesAmount] = useState<number>(0);
  const { closeModal } = useContext(ModalContext);

  const [createCategory] = useCreateCategoryMutation();
  const [createPlanningOrders] = useCreatePlanningOrdersMutation();

  const createNewActiveStrategyWithNewPlanningOrder = async () => {
    var strategyId = await addNewActiveStrategy();
    if (strategyId) {
      await addNewPlanningOrder(strategyId);
    }
  };

  const addNewActiveStrategy = async (): Promise<number | undefined> => {
    try {
      if (!finishTime) {
        dispatch(setAlertMessage('Select finish time'));
        dispatch(setShowAlert(!showAlert));
        return;
      } else if (!buyAccessValueId) {
        dispatch(setAlertMessage('Select buy access value'));
        dispatch(setShowAlert(!showAlert));
        return;
      } else if (!sellAccessValueId) {
        dispatch(setAlertMessage('Select sell access value'));
        dispatch(setShowAlert(!showAlert));
        return;
      }

      const body = {
        StartTime: new Date().toISOString(),
        FinishTime: new Date(finishTime).toISOString(),
        BuySymbol: buySymbol,
        SellSymbol: sellSymbol,
        PairSymbol: pairSymbol,
        BuyAccessValueId: +buyAccessValueId,
        SellAccessValueId: +sellAccessValueId,
        UserId: userId,
        StrategyType: type,
        Multiplayer: +multiplayer,
        TimeDelay: timeDelay,
        TimeRandomDelta: timeRandomDelta,
        InvokesAmount: invokesAmount,
      };

      let res = await createCategory({
        userId,
        body,
      }).unwrap();

      refetchActiveStrategies();
      closeModal();

      return res.ActiveStrategyId;
    } catch (error) {
      console.log(error);
    }
  };

  const addNewPlanningOrder = async (strategyId: number | undefined) => {
    const body = [
      {
        ActiveStrategyId: strategyId,
        PriceRatio: 0,
        AmountRatio: 0,
        AmountAdjust: 0,
        AmountRandomDelta: 0,
        PriceAdjust: 0,
        PriceDecimal: 0,
        AmountDecimal: 0,
        TokensAmount: 0,
        IsToBuyTokens: false,
      },
    ];

    await createPlanningOrders({
      userId,
      body,
    }).unwrap();
  };

  return (
    <>
      <Form.Group controlId="formName">
        <Form.Label>Finish time</Form.Label>
        <Form.Control
          type="datetime-local"
          placeholder="Finish time"
          value={finishTime}
          onChange={(e) => setFinishTime(e.target.value)}
        />
        <Form.Label className="mt-2">Buy symbol</Form.Label>
        <Form.Control placeholder="Buy symbol" value={buySymbol} disabled />
        <Form.Label className="mt-2">Sell symbol</Form.Label>
        <Form.Control placeholder="Sell symbol" value={sellSymbol} disabled />
        <Form.Label className="mt-2">Pair symbol</Form.Label>
        <Form.Control placeholder="Pair symbol" value={sellSymbol + '-' + buySymbol} disabled />
        <Form.Label className="mt-2">Buy access value</Form.Label>
        <Form.Control
          as="select"
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
        </Form.Control>
        <Form.Label className="mt-2">Sell access value</Form.Label>
        <Form.Control
          as="select"
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
        </Form.Control>
        <div className="flex mt-4">
          <div className="mr-4">
            <Button variant={type === 1 ? 'primary' : 'outline-primary'} onClick={() => setType(1)}>
              Book
            </Button>
          </div>
          <div className="mr-4">
            <Button variant={type === 2 ? 'primary' : 'outline-primary'} onClick={() => setType(2)}>
              Trade
            </Button>
          </div>
          <div>
            <Button variant={type === 3 ? 'primary' : 'outline-primary'} onClick={() => setType(3)}>
              Pump
            </Button>
          </div>
        </div>
        <div>
          <div className="form-check mt-3">
            <Form.Check
              type="checkbox"
              label="Enabled"
              checked={multiplayer}
              onChange={(e) => setMultiplayer(e.target.checked)}
              style={{ marginLeft: '-23px' }}
            />
          </div>
          {type === 3 ? (
            <div className="mt-2">
              <Form.Label>Invokes amount: {invokesAmount}</Form.Label>
              <Form.Range min="0" max="60" step="1" value={invokesAmount} onChange={(e) => setInvokesAmount(+e.target.value)} />
            </div>
          ) : null}
          <div className="mt-2">
            <Form.Label>Time delay: {timeDelay}</Form.Label>
            <Form.Range
              min="0"
              max="60"
              step="1"
              value={timeDelay}
              onChange={(nextValues) => setTimeDelay(+nextValues.target.value)}
            />
          </div>
          <div>
            <Form.Label>Time random delta: {timeRandomDelta}</Form.Label>
            <Form.Range
              min="0"
              max="60"
              step="1"
              value={timeRandomDelta}
              onChange={(nextValues) => setTimeRandomDelta(+nextValues.target.value)}
            />
          </div>
        </div>
      </Form.Group>
      <footer className="d-flex justify-content-end mt-4">
        <Button variant="primary" className="mr-2" onClick={createNewActiveStrategyWithNewPlanningOrder}>
          Save
        </Button>
        <Button variant="danger" onClick={closeModal}>
          Close
        </Button>
      </footer>
    </>
  );
};

export default AddNewStrategyModalNew;
