const CONSTANTS = require('./constants.js');
const fs = require('fs');

function getMonthCode(month) {
  return CONSTANTS.CODE_OF_MONTHS[Number(month)];
};

function getYearCode(year) {
  year = correctionYear(year);
  const index = year.slice(0, 2) % CONSTANTS.FOR_YEAR_CODE;
  const centuryIndex = CONSTANTS.CODE_OF_CENTURY[index];
  const lastTwoDigitsOfYear = (Number(year.slice(2)));
  return (centuryIndex + lastTwoDigitsOfYear +
    Math.floor(lastTwoDigitsOfYear / CONSTANTS.FOR_YEAR_CODE)) %
        CONSTANTS.NUMBER_DAYS_OF_WEEK;
};

function correctionYear(year) {
  if (year.length < CONSTANTS.MIN_YEAR_LENGHT) year += CONSTANTS.DOUBLE_ZERO;
  return year;
}

function checkLeapYear(year) {
  year = correctionYear(year);
  return ((year % CONSTANTS.INDEX_CHECK_LEAP_YEAR === 0 &&
    (year % CONSTANTS.INDEX_CHECK_LEAP_YEAR_2 !== 0)) ||
    (year % CONSTANTS.INDEX_CHECK_LEAP_YEAR_3 === 0));
};

function correctionLeapYear(year, month) {
  if (checkLeapYear(year) && Number(month) < CONSTANTS.MARCH) {
    return -1;
  };
  return 0;
};

function getDayOfWeek(numberDay, correction, codeMons, codeYear) {
  const numberOfDays = CONSTANTS.NUMBER_DAYS_OF_WEEK;
  const dayOfWeek = (correction + Number(numberDay) + codeMons + codeYear) %
    numberOfDays;
  return ((dayOfWeek + CONSTANTS.FOR_DAY) % numberOfDays) + 1;
};

function getNumberOfDaysPerMonth(month, year) {
  let dayOfMonth;
  year = correctionYear(year);
  month = Number(month);
  if (month < CONSTANTS.MIN_MONTH) {
    if (month !== CONSTANTS.FEBRUARY) {
      dayOfMonth = CONSTANTS.NUM_DAYS_OF_SMALL_MONTHS + (month % 2);
    } else if (checkLeapYear(year)) {
      dayOfMonth = CONSTANTS.NUM_DAYS_OF_BIG_FEBRUARY;
    } else dayOfMonth = CONSTANTS.NUM_DAYS_OF_SMALL_FEBRUARY;
  } else dayOfMonth = CONSTANTS.NUM_DAYS_OF_BIG_MONTHS - (month % 2);
  return dayOfMonth;
};

function checkForPartition(i) {
  const numDayOfWeek = CONSTANTS.NUMBER_DAYS_OF_WEEK;
  return ((i % numDayOfWeek === 0) &&
   (i / numDayOfWeek !== CONSTANTS.LAST_DAY));
}

function readFile() {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(CONSTANTS.FILE_PARTS_PATH, 'utf8', (err, data) => {
      if (err) throw err;
      const lines = data.split(CONSTANTS.SEMICOLON);
      resolve(lines);
    });
  });
  return promise;
}

function makeTable(firstDay, numberOfDays, frame) {
  const [top, middle, bottom, betweenColumns, gap, empty, zero] = frame;
  let counterNum = 1;
  let table = top;
  for (let i = 1; i < firstDay; i++) {
    table += gap + betweenColumns;
  }
  for (let i = firstDay; i <= CONSTANTS.NUM_CALENDAR_CELLS; i++) {
    const lastDay = numberOfDays + firstDay;
    table = table + ((counterNum < CONSTANTS.NUMBER_OF_DIGIT) ? zero : empty) +
    ((i >= lastDay) ? gap : counterNum) +
    (checkForPartition(i) ? middle : betweenColumns);
    counterNum++;
  }
  table += CONSTANTS.DOT + bottom;
  return table;
}

function makeCurrentTable(month, year, frame) {
  const correction = correctionLeapYear(year, month);
  const codeMonth = getMonthCode(month);
  const codeYear = getYearCode(year);
  const numberOfDays = getNumberOfDaysPerMonth(month, year);
  const firstDay = getDayOfWeek(CONSTANTS.STRING_FIRST_NUMBER,
    correction, codeMonth, codeYear);
  return makeTable(firstDay, numberOfDays, frame);
}

module.exports = { makeCurrentTable, readFile };
