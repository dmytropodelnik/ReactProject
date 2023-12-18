import { VictoryArea, VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryTheme, VictoryTooltip } from 'victory';

export interface IOpenOrder {
  Id: string;
  Symbol: string;
  Side: number;
  Type: number;
  Amount: number;
  Price: number;
}

const OpenOrdersChart = ({ greenOrders, redOrders }: { greenOrders: IOpenOrder[]; redOrders: IOpenOrder[] }) => {
  if (!greenOrders || !redOrders)
    return (
      <div className="max-w-[1180px] m-auto my-2 px-2">
        <div className="rounded border border-sky-900/10 bg-sky-50 p-6 text-sky-700 mx-auto w-fit flex flex-col items-center">
          <strong className="text-sm font-medium">No Data.</strong>
        </div>
      </div>
    );

  return (
    <VictoryChart width={1000} height={400} theme={VictoryTheme.material}>
      <VictoryAxis tickFormat={(item) => item} />
      <VictoryAxis standalone={true} dependentAxis tickFormat={(item) => item} />
      <VictoryGroup>
        <VictoryArea
          interpolation="natural"
          x="Price"
          y="Amount"
          style={{
            data: {
              fill: 'rgba(53, 235, 111, 0.5)',
              stroke: 'rgb(53, 235, 111)',
            },
          }}
          data={greenOrders}
          animate={{
            duration: 500,
          }}
        />
        <VictoryBar
          x="Price"
          y="Amount"
          data={greenOrders}
          labelComponent={<VictoryTooltip />}
          labels={({ datum }) => [
            'Price: ' + datum.Price,
            'Amount: ' + datum.Amount,
            'Total ' + (datum.Price * datum.Amount).toFixed(2) + datum.Symbol,
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
                          style: Object.assign(props.style, { opacity: 0.2 }),
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
          x="Price"
          y="Amount"
          style={{
            data: {
              fill: 'rgba(235, 53, 53, 0.5)',
              stroke: 'rgb(235, 53, 53)',
            },
          }}
          data={redOrders}
          animate={{
            duration: 500,
          }}
        />
        <VictoryBar
          x="Price"
          y="Amount"
          data={redOrders}
          labelComponent={<VictoryTooltip />}
          labels={({ datum }) => [
            'Price: ' + datum.Price,
            'Amount: ' + datum.Amount,
            'Total: ' + (datum.Price * datum.Amount).toFixed(2) + ' USDT',
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
                          style: Object.assign(props.style, { opacity: 0.2 }),
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
  );
};

export default OpenOrdersChart;
