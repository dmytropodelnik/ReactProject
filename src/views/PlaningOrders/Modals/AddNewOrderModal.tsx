import React, { useContext, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { getChartData } from '../utils';
import { useCreatePlanningOrdersMutation } from '../../../api/api-planning-orders';
import { IChartData } from '../../../models/interfaces/IChartData';
import { ModalContext } from '../../../contexts/ModalProvider/ModalProvider';

export interface IAddOrderModalProps {
  addNewOrdersToList: () => void;
  chartData: IChartData[];
  setChartData: (data: IChartData[]) => void;
  userId: string | number;
}

const AddNewOrderModal: React.FC<IAddOrderModalProps> = ({ addNewOrdersToList, chartData, setChartData, userId }) => {
  const [priceRatio, setPriceRatio] = useState<number>(0);
  const [amountRatio, setAmountRatio] = useState<number>(0);

  const { closeModal } = useContext(ModalContext);
  const [createPlanningOrders] = useCreatePlanningOrdersMutation();

  const addPlaningOrder = async () => {
    if (amountRatio && priceRatio) {
      const newChartData = [...chartData];
      const newOrder = {
        ...chartData[0],
        AmountRatio: amountRatio,
        PriceRatio: priceRatio,
      };

      newChartData.push(newOrder);

      const result = getChartData(newChartData.sort((a, b) => a.PriceRatio - b.PriceRatio));
      const body = [
        {
          ActiveStrategyId: newOrder.ActiveStrategyId,
          PriceRatio: newOrder.PriceRatio,
          AmountRatio: newOrder.AmountRatio,
          AmountAdjust: newOrder.AmountAdjust,
          AmountRandomDelta: newOrder.AmountRandomDelta,
          PriceAdjust: newOrder.PriceAdjust,
          PriceDecimal: newOrder.PriceDecimal,
          AmountDecimal: newOrder.AmountDecimal,
          TokensAmount: 0,
          IsToBuyTokens: false,
        },
      ];

      await createPlanningOrders({
        userId,
        body,
      }).unwrap();

      closeModal();
      addNewOrdersToList();
      setChartData(result);
    }
  };

  return (
    <>
      <Form.Group controlId="formName">
        <Form.Label>Price ratio</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter price ratio"
          value={priceRatio}
          onChange={(e) => setPriceRatio(+e.target.value)}
        />
        <Form.Label>Amount ratio</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter amount ratio"
          className="mb-4"
          value={amountRatio}
          onChange={(e) => setAmountRatio(+e.target.value)}
        />
      </Form.Group>
      <footer className="d-flex justify-content-end mt-4">
        <Button variant="primary" className="mr-2" onClick={addPlaningOrder}>
          Add
        </Button>
        <Button variant="danger" onClick={closeModal}>
          Close
        </Button>
      </footer>
    </>
  );
};

export default AddNewOrderModal;
