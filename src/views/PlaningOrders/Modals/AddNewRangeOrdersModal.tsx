import React, { useContext, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { getChartData } from '../utils';
import { useCreatePlanningOrdersMutation } from '../../../api/api-planning-orders';
import { IAddOrderModalProps } from './AddNewOrderModal';
import { ModalContext } from '../../../contexts/ModalProvider/ModalProvider';

const AddNewRangeOrdersModal: React.FC<IAddOrderModalProps> = ({ addNewOrdersToList, chartData, setChartData, userId }) => {
  const [startPriceRatio, setStartPriceRatio] = useState<number>(0);
  const [priceRatioDelta, setPriceRatioDelta] = useState<number>(0);
  const [amountRatio, setAmountRatio] = useState<number>(0);
  const [linesCount, setLinesCount] = useState<number>(0);

  const { closeModal } = useContext(ModalContext);
  const [createPlanningOrders] = useCreatePlanningOrdersMutation();

  const addRangePlanningOrders = async () => {
    if (!startPriceRatio || !amountRatio || !priceRatioDelta || !linesCount) return;

    const rangeData = [];
    let currentPrice = startPriceRatio;

    for (let i = 0; i < linesCount; i++) {
      if (i > 0) {
        currentPrice = currentPrice + priceRatioDelta;
      }

      const newOrder = {
        ...chartData[i],
        AmountRatio: Number(amountRatio.toFixed(4)),
        PriceRatio: Number(currentPrice.toFixed(4)),
      };

      rangeData.push(newOrder);
    }
    const newData = [...chartData, ...rangeData];
    const result = getChartData(newData.sort((a, b) => a.PriceRatio - b.PriceRatio));

    const body = [];

    for (let i = 0; i < linesCount; i++) {
      body.push({
        ActiveStrategyId: rangeData[0].ActiveStrategyId,
        PriceRatio: rangeData[i].PriceRatio,
        AmountRatio: rangeData[i].AmountRatio,
        AmountAdjust: 0,
        AmountRandomDelta: 0,
        PriceAdjust: 0,
        PriceDecimal: rangeData[0].PriceDecimal,
        AmountDecimal: rangeData[0].AmountDecimal,
        TokensAmount: 0,
        IsToBuyTokens: false,
      });
    }

    await createPlanningOrders({
      userId: userId as string | number,
      body,
    }).unwrap();

    closeModal();
    addNewOrdersToList();
    setChartData(result);
  };

  return (
    <>
      <Form.Group controlId="formName">
        <Form.Label>Start price ratio</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter price ratio"
          value={startPriceRatio}
          onChange={(e) => setStartPriceRatio(+e.target.value)}
        />
        <Form.Label>Price ratio delta</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter price ratio delta"
          value={priceRatioDelta}
          onChange={(e) => setPriceRatioDelta(+e.target.value)}
        />
        <Form.Label>Amount ratio</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter amount ratio"
          value={amountRatio}
          onChange={(e) => setAmountRatio(+e.target.value)}
        />
        <Form.Label>Lines count</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter lines count"
          value={linesCount}
          onChange={(e) => setLinesCount(+e.target.value)}
        />
      </Form.Group>
      <footer className="d-flex justify-content-end mt-4">
        <Button variant="primary" className="mr-2" onClick={addRangePlanningOrders}>
          Add
        </Button>
        <Button variant="danger" onClick={closeModal}>
          Close
        </Button>
      </footer>
    </>
  );
};

export default AddNewRangeOrdersModal;
