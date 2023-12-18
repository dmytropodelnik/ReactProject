import { useEffect, useState } from 'react';
import { VictoryPie } from 'victory';
import { Spinner } from '../../../components/Spinner';
import { getChartsPercent } from '../utils';
import IСoordinates from '../../../models/interfaces/IСoordinates';
import IChartBalance from '../../../models/interfaces/IChartBalance';

export interface IModalBalance {
  balance?: IChartBalance;
  isLoading: boolean;
  SellSymbol: string;
  decimals: number;
  strategyType: number;
}

const BalanceModal: React.FC<IModalBalance> = ({ balance, isLoading, SellSymbol, decimals }) => {
  const [modalBalance, setModalBalance] = useState<IСoordinates[]>([]);
  const [totalSum, setTotalSum] = useState<number>(0);

  useEffect(() => {
    if (balance && balance.price) {
      setModalBalance([
        {
          x: 'Buy Total',
          y: balance.BuyTotal,
          color: 'rgba(235, 53, 53, 0.7)',
        },
        {
          x: 'Sell Total',
          y: balance.SellTotal * balance.price,
          color: 'rgba(53, 235, 111, 0.7)',
        },
      ]);
      setTotalSum(balance.SellTotal * balance.price + balance.BuyTotal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  return (
    <div className="max-w-[1000px]">
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center  min-h-[570px] w-[440px]">
            <Spinner />
          </div>
        ) : !balance || !balance.price ? (
          <div className="flex justify-center items-center text-xl font-bold w-[190px]">
            <p>No data</p>
          </div>
        ) : (
          // <CustomAlert message="No data" />
          <div className="flex justify-between">
            {totalSum === 0 ? (
              <div className="flex justify-center items-center text-xl font-bold w-[190px]">
                <p>No data</p>
              </div>
            ) : (
              <div className="flex justify-center items-center text-xl font-bold w-[190px]">
                <VictoryPie
                  labelRadius={35}
                  width={150}
                  padding={5}
                  height={150}
                  data={modalBalance}
                  x="Symbol"
                  style={{
                    data: { fill: ({ datum }) => datum.color },
                    labels: { fill: '#000', fontSize: 10, fontWeight: 'bold' },
                  }}
                  labels={({ datum }) => [getChartsPercent(totalSum, datum.y)]}
                />
              </div>
            )}
            <table className="table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Color</th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Coin</th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Amount</th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">USDT value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {modalBalance.map((item: IСoordinates, index: number) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      <div
                        style={{ backgroundColor: item.color }}
                        className="w-[20px] h-[20px] border-[1px] border-solid border-[#c7c7c7]"></div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      {item.x === 'Buy Total' ? 'USDT' : SellSymbol}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {item.x === 'Buy Total' ? item.y.toFixed(2) : balance.SellTotal.toFixed(decimals)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{item.y.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceModal;
