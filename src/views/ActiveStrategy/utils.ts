export const getRandomColors = () => {
  const colors = [
    'rgb(253 186 116)',
    'rgb(190 242 100)',
    'rgb(134 239 172)',
    'rgb(94 234 212)',
    'rgb(103 232 249)',
    'rgb(165 180 252)',
    'rgb(240 171 252)',
    'rgb(253 164 175)',
  ];
  let firstColor = colors[Math.floor(Math.random() * colors.length)];
  colors.splice(colors.indexOf(firstColor), 1);
  let secondColor = colors[Math.floor(Math.random() * colors.length)];
  return [firstColor, secondColor];
};

export const getChartsPercent = (total: number, amount: number) => {
  return Math.round(amount / (total / 100)) + '%';
};
