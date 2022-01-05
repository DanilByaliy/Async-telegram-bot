const CONSTANTS = require('./constants.js');

function getMonthCode(month) {
  return CONSTANTS.CODE_OF_MONTHS[Number(month)];
};

function getYearCode(year) {
  year = correctionYear(year);
  const centuryIndex = (3 - (year.slice(0, 2) % 4)) * 2;
  const lastTwoDigitsOfYear = (Number(year.slice(2)));
  return (centuryIndex + lastTwoDigitsOfYear +
    Math.floor(lastTwoDigitsOfYear / 4)) %
        CONSTANTS.NUMBER_DAYS_OF_WEEK;
};

function correctionYear(year) {
  return ((year.length < CONSTANTS.MIN_YEAR_LENGHT) ? '00' : '') + year;
}

function checkLeapYear(year) {
  year = correctionYear(year);
  return ((year % CONSTANTS.INDEX_CHECK_LEAP_YEAR === 0 &&
        (year % CONSTANTS.INDEX_CHECK_LEAP_YEAR_2 !== 0)) ||
        (year % CONSTANTS.INDEX_CHECK_LEAP_YEAR_3 === 0));
};

function correctionLeapYear(year, month) {
  if (checkLeapYear(year) && Number(month) < 3) {
    return -1;
  };
  return 0;
};

function getDayOfWeek(numberDay, correction, codeMons, codeYear) {
  const dayOfWeek = (correction + Number(numberDay) + codeMons + codeYear) % 7;
  return ((dayOfWeek + 5) % CONSTANTS.NUMBER_DAYS_OF_WEEK) + 1;
};

function getNumberOfDaysPerMonth(month, year) {
  let dayOfMonth;
  year = correctionYear(year);
  month = Number(month);
  if (month < 8) {
    if (month !== 2) {
      dayOfMonth = CONSTANTS.NUM_DAYS_OF_SMALL_MONTHS + (month % 2);
    } else if (checkLeapYear(year)) {
      dayOfMonth = CONSTANTS.NUM_DAYS_OF_BIG_FEBRUARY;
    } else dayOfMonth = CONSTANTS.NUM_DAYS_OF_SMALL_FEBRUARY;
  } else dayOfMonth = CONSTANTS.NUM_DAYS_OF_BIG_MONTHS - (month % 2);
  return dayOfMonth;
};

const top = `┌───  ────  ─────  ─────  ────  ───┐.
│ ПН    ВТ    СР    ЧТ    ПТ    СБ     НД │.
├─   ─┬─   ─┬─   ─┬─   ─┬─   ─┬─   ─┬─   ─┤.
│ `;
const middle = `  │.
├─   ─┼─   ─┼─   ─┼─   ─┼─   ─┼─   ─┼─   ─┤.
│ `;

const bottom = `
└─   ─┴─   ─┴─   ─┴─   ─┴─   ─┴─   ─┴─   ─┘.
`;
const betweenColumns = '  │ ';

function makeTable(firstDay, numberOfDays) {
  let counterNum = 1;
  let table = top;
  const numDayOfWeek = CONSTANTS.NUMBER_DAYS_OF_WEEK;
  for (let i = 1; i < firstDay; i++) {
    table += '  ' + betweenColumns;
  }
  for (let i = firstDay; i <= CONSTANTS.NUM_CALENDAR_CELLS; i++) {
    const lastDay = numberOfDays + firstDay;
    table = table + ((counterNum < CONSTANTS.NUMBER_OF_DIGIT) ? '0' : '') +
    ((i >= lastDay) ? '  ' : counterNum) +
    (((i % numDayOfWeek === 0) && (i / numDayOfWeek !== 6)) ? middle : middle);
    counterNum++;
  }
  table += '.' + bottom;
  return table;
}

function makeCurrentTable(month, year) {
  const correction = correctionLeapYear(year, month);
  const codeMonth = getMonthCode(month);
  const codeYear = getYearCode(year);
  const numberOfDays = getNumberOfDaysPerMonth(month, year);
  const firstDay = getDayOfWeek(CONSTANTS.STRING_FIRST_NUMBER,
    correction, codeMonth, codeYear);
  return makeTable(firstDay, numberOfDays);
}

module.exports = { makeCurrentTable };
