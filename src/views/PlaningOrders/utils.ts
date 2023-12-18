import { IPlaningOrders } from './PlaningOrders';
import IChartBalance from '../../models/interfaces/IChartBalance';
import { IChartData } from '../../models/interfaces/IChartData';

export const getChartData = (data: IPlaningOrders[]) => {
  const greenChart: IChartData[] = [];
  const redChart: IChartData[] = [];
  let currentSumRed: number = 0;
  let currentSumGreen: number = 0;

  // split data into two arrays for different charts
  data.map((current) => {
    return current.PriceRatio < 1 ? greenChart.push(current) : redChart.push(current);
  });

  // add sum
  greenChart.reverse().map((current, i) => {
    currentSumGreen = currentSumGreen + current.AmountRatio;
    return greenChart.splice(i, 1, {
      ...current,
      sum: Number(currentSumGreen.toFixed(4)),
    });
  });
  redChart.map((current, i) => {
    currentSumRed = currentSumRed + current.AmountRatio;
    return redChart.splice(i, 1, {
      ...current,
      sum: Number(currentSumRed.toFixed(4)),
    });
  });

  return [...greenChart, ...redChart];
};

export const getTablePriceRatio = (PriceRatio: number, filter: string, decimals: number, price: number) => {
  switch (filter) {
    case 'Percentage':
      return (PriceRatio * 100).toFixed(2) + ' %';
    case 'Amounts':
      return (PriceRatio * price).toFixed(decimals);
    default:
      return PriceRatio;
  }
};

export const getTableAmount = (Amount: number, filter: string, decimals: number, balance: number, symbol: string) => {
  switch (filter) {
    case 'Percentage':
      return (Amount * 100).toFixed(2) + ' %';
    case 'Amounts':
      return (Amount * balance).toFixed(decimals) + ' ' + symbol;
    default:
      return Amount;
  }
};

export const getTableAmountUSDT = (Amount: number, Price: number, balance: IChartBalance, decimals?: number, symbol?: string) => {
  return symbol
    ? (Price * balance.price * Amount * balance.SellTotal).toFixed(decimals) + ' ' + symbol
    : (Price * balance.price * Amount * balance.SellTotal).toFixed(decimals);
};

export const getChartSumAxis = (sum: number, filter: string) => {
  switch (filter) {
    case 'Percentage':
      return Number((sum * 100).toFixed(2)) + ' %';
    default:
      return sum;
  }
};

export const getChartSum = (sum: number, filter: string, decimals: number, symbol?: string) => {
  switch (filter) {
    case 'Percentage':
      return Number((sum * 100).toFixed(2)) + ' %';
    case 'Amounts':
      return sum.toFixed(decimals) + ' ' + symbol;
    default:
      return sum;
  }
};

export const checkUSDTlower = (chartData: IChartData[], balance: IChartBalance) => {
  return chartData.some((item) => item.AmountRatio * balance.BuyTotal < 5);
};

export const simulation = (MIN_BAR_SIZE: number, MAX_BAR_SIZE: number, MAX_DELAY: number) => {
  const MINUTES_IN_DAY = 1440;
  const chartData = new Array(MINUTES_IN_DAY).fill(0);

  for (let i = 0; i < MINUTES_IN_DAY; i++) {
    const delay = Math.floor(Math.random() * (MAX_DELAY + 1));
    const barSize = Math.floor(Math.random() * (MAX_BAR_SIZE - MIN_BAR_SIZE + 1)) + MIN_BAR_SIZE;
    const index = (i + Math.floor(delay / 60)) % MINUTES_IN_DAY;
    chartData[index] += barSize;
  }

  return chartData;
};
