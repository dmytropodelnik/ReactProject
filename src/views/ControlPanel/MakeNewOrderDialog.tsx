import React, { useContext, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useCreatePlanningOrderMutation } from '../../api/api-planning-orders';
import { ModalContext } from '../../contexts/ModalProvider/ModalProvider';

export interface IMakeNewOrder {
  userId: string;
  symbol: string;
  refetchOpenOrders: () => Promise<void>;
}

const MakeNewOrderDialog: React.FC<IMakeNewOrder> = ({ userId, symbol, refetchOpenOrders }) => {
  const [price, setPrice] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [isBuyOrder, setIsBuyOrder] = useState<boolean>(true);

  const { closeModal } = useContext(ModalContext);
  const [createPlanningOrder] = useCreatePlanningOrderMutation();

  const makeNewOrder = async () => {
    try {
      await createPlanningOrder({
        userId,
        symbol,
        price: price.toString(),
        amount: amount.toString(),
        isBuyOrder,
      }).unwrap();

      await refetchOpenOrders();

      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Form.Group controlId="formName">
        <Form.Label>Price</Form.Label>
        <Form.Control
          type="number"
          className="mb-2"
          placeholder="Enter price ratio"
          value={price}
          onChange={(e) => setPrice(+e.target.value)}
        />
        <Form.Label>Amount</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter amount ratio"
          className="mb-2"
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
        />
        <Form.Label>Type</Form.Label>
        <Form.Control
          as="select"
          value={isBuyOrder ? '1' : '0'}
          onChange={(e) => {
            setIsBuyOrder(e.target.value === '1' ? true : false);
          }}>
          <option value="1">Buy</option>
          <option value="0">Sell</option>
        </Form.Control>
      </Form.Group>
      <footer className="d-flex justify-content-end mt-4">
        <Button variant="primary" className="mr-2" onClick={makeNewOrder}>
          Add
        </Button>
        <Button variant="danger" onClick={closeModal}>
          Close
        </Button>
      </footer>
    </>
  );
};

export default MakeNewOrderDialog;
