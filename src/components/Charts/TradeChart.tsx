import { VictoryAxis, VictoryBar, VictoryChart } from 'victory';

export default function TradeChart({ chartData }: { chartData: number[] }) {
  return (
    <VictoryChart
      width={1000}
      height={300}
      padding={{ top: 50, bottom: 50, right: 50, left: 90 }}>
      <VictoryAxis
        tickCount={12}
        tickFormat={(item) => Math.round(item / 60) + ' hours'}
        style={{
          tickLabels: { fontSize: 12, padding: 5 },
        }}
      />
      <VictoryAxis
        dependentAxis
        tickFormat={(item) => item + ' USDT'}
        style={{
          tickLabels: { fontSize: 12, padding: 5 },
        }}
      />
      <VictoryBar
        style={{
          data: { fill: 'rgba(53, 235, 111, 0.5)' },
        }}
        data={chartData}
      />
    </VictoryChart>
  );
}
