const timespan = require('timespan');

export function getTimeDifferenceShortString(
  destinationDate: Date,
  startDate: Date = new Date(),
): string {
  const timeSpanObject = timespan.fromDates(destinationDate, startDate);
  const typeOfTime = {
    day: timeSpanObject.totalDays(),
    hr: timeSpanObject.totalHours() % 24,
    min: timeSpanObject.totalMinutes() % 60,
    sec: timeSpanObject.totalSeconds() % 60,
  };
  for (let index = 0; index < Object.keys(typeOfTime).length; index++) {
    const numberOfTypeOfTime = Math.floor(Object.values(typeOfTime)[index]);
    if (numberOfTypeOfTime > 0) {
      if (index < 3) {
        const nextTypeOfTime = Math.floor(Object.values(typeOfTime)[index + 1]);
        if (nextTypeOfTime > 0) {
          return `${numberOfTypeOfTime}${
            Object.keys(typeOfTime)[index][0]
          }  ${nextTypeOfTime}${Object.keys(typeOfTime)[index + 1][0]} ago`;
        }
      }
      return `${numberOfTypeOfTime}${Object.keys(typeOfTime)[index][0]} ago`;
    }
  }
  return 'in 0 sec';
}
