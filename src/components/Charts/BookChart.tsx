import { useEffect, useState } from 'react';
import { VictoryArea, VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryTheme, VictoryTooltip } from 'victory';
import IChartBalance from '../../models/interfaces/IChartBalance';
import { IChartData } from '../../models/interfaces/IChartData';
import { getChartSum, getChartSumAxis, getTableAmountUSDT, getTablePriceRatio } from '../../views/PlaningOrders/utils';

const PlanningOrdersChart = ({
  chartData,
  filter,
  balance,
  buySymbol = '',
}: {
  chartData: IChartData[];
  filter: string;
  balance: IChartBalance;
  buySymbol?: string;
}) => {
  const [greenChartData, setGreenChartData] = useState<IChartData[]>([]);
  const [redChartData, setRedChartData] = useState<IChartData[]>([]);

  useEffect(() => {
    if (chartData) {
      const greenChart: IChartData[] = [];
      const redChart: IChartData[] = [];
      chartData.map((current) => {
        return current.sum
          ? current.PriceRatio < 1
            ? greenChart.push(
                filter === 'Amounts'
                  ? {
                      ...current,
                      sum: current.sum * balance.BuyTotal,
                      AmountRatio: current.AmountRatio * balance.BuyTotal,
                    }
                  : current,
              )
            : redChart.push(
                filter === 'Amounts'
                  ? {
                      ...current,
                      sum: Number(getTableAmountUSDT(current.sum, current.PriceRatio, balance, current.AmountDecimal)),
                      AmountRatio: Number(
                        getTableAmountUSDT(current.AmountRatio, current.PriceRatio, balance, current.AmountDecimal),
                      ),
                    }
                  : current,
              )
          : 'No Data';
      });
      setRedChartData(redChart);
      setGreenChartData(greenChart);
    }
  }, [chartData, filter, balance]);

  return (
    <div className="w-full px-1">
      {greenChartData.length || redChartData.length ? (
        <VictoryChart width={1000} height={400} theme={VictoryTheme.material}>
          <VictoryAxis
            tickFormat={(item) => getTablePriceRatio(item, filter, chartData[0]?.PriceDecimal || 4, balance.price || 0)}
          />
          <VictoryAxis standalone={true} dependentAxis tickFormat={(item) => getChartSumAxis(item, filter)} />
          <VictoryGroup>
            <VictoryArea
              interpolation="natural"
              x="PriceRatio"
              y="sum"
              style={{
                data: {
                  fill: 'rgba(53, 235, 111, 0.5)',
                  stroke: 'rgb(53, 235, 111)',
                },
              }}
              data={greenChartData}
              animate={{
                duration: 500,
              }}
            />
            <VictoryBar
              x="PriceRatio"
              y="sum"
              data={greenChartData}
              labelComponent={<VictoryTooltip />}
              labels={({ datum }) => [
                'Price Ratio: ' +
                  getTablePriceRatio(datum.PriceRatio, filter, datum.PriceDecimal || 4, balance.price || 0).toString(),
                'Sum: ' + getChartSum(datum.sum, filter, datum.PriceDecimal || 4, buySymbol),
              ]}
              style={{
                data: { fill: 'rgb(53, 235, 111 )', opacity: 0.2, width: 3 },
              }}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onMouseEnter: () => {
                      return [
                        {
                          target: 'data',
                          mutation: (props) => {
                            return {
                              style: Object.assign(props.style, { opacity: 1 }),
                            };
                          },
                        },
                      ];
                    },
                    onMouseLeave: () => {
                      return [
                        {
                          target: 'data',
                          mutation: (props) => {
                            return {
                              style: Object.assign(props.style, {
                                opacity: 0.2,
                              }),
                            };
                          },
                        },
                      ];
                    },
                  },
                },
              ]}
              animate={{
                duration: 500,
              }}
            />
            <VictoryArea
              interpolation="natural"
              x="PriceRatio"
              y="sum"
              style={{
                data: {
                  fill: 'rgba(235, 53, 53, 0.5)',
                  stroke: 'rgb(235, 53, 53)',
                },
              }}
              data={redChartData}
              animate={{
                duration: 500,
              }}
            />
            <VictoryBar
              x="PriceRatio"
              y="sum"
              data={redChartData}
              labelComponent={<VictoryTooltip />}
              labels={({ datum }) => [
                'Price Ratio: ' + getTablePriceRatio(datum.PriceRatio, filter, datum.PriceDecimal || 4, balance.price || 0),
                'Sum: ' + getChartSum(datum.sum, filter, datum.PriceDecimal || 4, buySymbol),
              ]}
              style={{
                data: { fill: 'rgb(235, 53, 53)', opacity: 0.2, width: 3 },
              }}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onMouseEnter: () => {
                      return [
                        {
                          target: 'data',
                          mutation: (props) => {
                            return {
                              style: Object.assign(props.style, { opacity: 1 }),
                            };
                          },
                        },
                      ];
                    },
                    onMouseLeave: () => {
                      return [
                        {
                          target: 'data',
                          mutation: (props) => {
                            return {
                              style: Object.assign(props.style, {
                                opacity: 0.2,
                              }),
                            };
                          },
                        },
                      ];
                    },
                  },
                },
              ]}
              animate={{
                duration: 500,
              }}
            />
          </VictoryGroup>
        </VictoryChart>
      ) : (
        <div className="max-w-[1180px] m-auto my-2 px-2">
          <div className="rounded border border-sky-900/10 bg-sky-50 p-6 text-sky-700 mx-auto w-fit flex flex-col items-center">
            <strong className="text-sm font-medium">No Data.</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningOrdersChart;
