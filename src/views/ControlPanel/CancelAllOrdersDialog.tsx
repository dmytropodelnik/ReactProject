import React, { FC, useEffect } from 'react';
import BaseDialog from '../../components/BaseDialog';
import Button from '../Button/Button';
import { useCancelOrdersMutation } from '../../api/api-planning-orders';

type Props = {
  isOpen: boolean;
  closeDialog: () => void;
  userId?: string;
  symbol?: string;
  refetchData: () => Promise<void>;
};

const CancelAllOrdersDialog: FC<Props> = ({ isOpen, closeDialog, userId, symbol, refetchData }) => {
  const [status, setStatus] = React.useState<'init' | 'success' | 'fail'>('init');
  const [cancelOrdersRequest] = useCancelOrdersMutation();

  useEffect(() => {
    setStatus('init');
  }, [isOpen]);

  const cancelOrders = async (userId: number | string, symbol: string) => {
    try {
      const res = await cancelOrdersRequest({
        id: userId,
        symbol: symbol,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const cancelClicked = async () => {
    try {
      if (!userId) return;
      if (!symbol) return;
      await cancelOrders(userId, symbol);
      refetchData();
      setStatus('success');
      setTimeout(() => {
        closeDialog();
      }, 3000);
    } catch (error) {
      console.log(error);
      setStatus('fail');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <BaseDialog isOpen={isOpen} closeDialog={closeDialog}>
      <>
        <h2 className="m-6">Are you sure?</h2>
        <h2 className="m-6">You want to cancel ALL Orders?</h2>
        <div className="text-center">
          {status === 'success' && <p className="text-green-500">Order cancelled successfully</p>}
          {status === 'fail' && <p className="text-red-500">Order cancellation failed</p>}
        </div>
        {/* a cancel button should be center aligned horizontally */}
        <div className="d-grid gap-2">
          <Button styleBtn={'btn btn-danger'} onClick={cancelClicked}>
            Cancel All Orders
          </Button>
        </div>
      </>
    </BaseDialog>
  );
};

export default CancelAllOrdersDialog;
