import React, { FC, useEffect } from 'react';
import BaseDialog from '../../components/BaseDialog';
import { IOpenOrder } from '../../components/Charts/OpenOrdersChart';
import Button from '../Button/Button';

type Props = {
  isOpen: boolean;
  closeDialog: () => void;
  orderInfo: IOpenOrder | null;
  buySymbol?: string;
  handleCancelClick: (order: IOpenOrder) => void;
};

const CancelDialog: FC<Props> = ({ isOpen, closeDialog, orderInfo, buySymbol, handleCancelClick }) => {
  const [status, setStatus] = React.useState<'init' | 'success' | 'fail'>('init');

  useEffect(() => {
    setStatus('init');
  }, [isOpen]);

  const cancelClicked = async () => {
    try {
      await handleCancelClick(orderInfo!);
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
        <h2>Are you sure?</h2>
        <table className="m-8 border-spacing-3 border-separate border border-black">
          <tbody className="space-x-2 space-y-3">
            <tr>
              <td>ID:</td>
              <td>{orderInfo?.Id}</td>
            </tr>
            <tr>
              <td>Symbol:</td>
              <td>{orderInfo?.Symbol}</td>
            </tr>
            <tr>
              <td>Side:</td>
              <td>{orderInfo?.Side === 0 ? 'BUY' : 'SELL'}</td>
            </tr>
            <tr>
              <td>Type:</td>
              <td>{orderInfo?.Type}</td>
            </tr>
            <tr>
              <td>Amount:</td>
              <td>{orderInfo?.Amount}</td>
            </tr>
            <tr>
              <td>Price:</td>
              <td>{orderInfo?.Price}</td>
            </tr>
            <tr>
              <td>Total:</td>
              {orderInfo && (
                <td>
                  {orderInfo.Price * orderInfo?.Amount} {buySymbol}
                </td>
              )}
            </tr>
          </tbody>
        </table>
        <div className="text-center">
          {status === 'success' && <p className="text-green-500">Order cancelled successfully</p>}
          {status === 'fail' && <p className="text-red-500">Order cancellation failed</p>}
        </div>
        <Button styleBtn={'btn btn-danger w-100 font-weight-bold py-2 px-4 rounded'} onClick={cancelClicked}>
          Cancel
        </Button>
      </>
    </BaseDialog>
  );
};

export default CancelDialog;
