import Button from '../Button/Button';

const OpenOrdersRow = ({
  price,
  amount,
  cumulativeAmount,
  total,
  orderId,
  index,
  isSellOrder,
  handleOrderCancellation,
}: {
  price: string;
  amount: string;
  cumulativeAmount: string;
  total: string;
  orderId: string;
  index: number;
  isSellOrder: boolean;
  buySymbol?: string;
  handleOrderCancellation: (order: string) => void;
}) => {
  const cancelOrder = () => {
    handleOrderCancellation(orderId);
  };

  let bgColor;
  if (isSellOrder) {
    if (index % 2 === 0) {
      bgColor = 'bg-red-50';
    } else {
      bgColor = 'bg-red-100';
    }
  } else {
    if (index % 2 === 0) {
      bgColor = 'bg-green-50';
    } else {
      bgColor = 'bg-green-100';
    }
  }
  return (
    <tr className={`border-b hover:bg-gray-50 ${bgColor}`}>
      <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">{index + 1}</td>
      <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">{price}</td>
      <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">{amount}</td>
      <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">{cumulativeAmount}</td>
      <td className="text-center py-2 px-[0.1rem] font-medium text-[12px] text-gray-900 whitespace-nowrap">{total}</td>
      <td className="text-center">
        <Button
          styleBtn={
            'btn btn-danger rounded-md py-1 px-1.5 me-2 my-1 w-60 text-xs font-medium text-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus:outline-none'
          }
          onClick={cancelOrder}>
          Cancel
        </Button>
      </td>
    </tr>
  );
};

export default OpenOrdersRow;
