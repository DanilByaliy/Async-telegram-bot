const CONSTANTS = require('./constants.js');
    
function getMonthCode(month) {
    return CONSTANTS.CODE_OF_MONTHS[Number(month)];
};
    
function getYearCode(year) {
    year = correctionYear(year);
    let centuryIndex = (3 - (year.slice(0, 2) % 4)) * 2;
    let lastTwoDigitsOfYear = (Number(year.slice(2)));
    return (centuryIndex + lastTwoDigitsOfYear + Math.floor(lastTwoDigitsOfYear/4)) 
        % CONSTANTS.NUMBER_DAYS_OF_WEEK;
};
    
function correctionYear(year) {
    return ((year.length < CONSTANTS.MIN_YEAR_LENGHT) ? '00' : '') + year;
}

function checkLeapYear(year) {
    year = correctionYear(year);
    return (year % CONSTANTS.INDEX_CHECK_LEAP_YEAR === 0 
        && (year % CONSTANTS.INDEX_CHECK_LEAP_YEAR_2 !== 0) 
        || (year % CONSTANTS.INDEX_CHECK_LEAP_YEAR_3 === 0))
};

function correctionLeapYear(year, month) {
    if (checkLeapYear(year) && Number(month) < 3) {
        return -1;
    };
    return 0;
};
    
function getDayOfWeek(numberDay, correction, codeMons, codeYear) {
    let dayOfWeek = (correction + Number(numberDay) + codeMons + codeYear) % 7;
    return ((dayOfWeek + 5) % CONSTANTS.NUMBER_DAYS_OF_WEEK) + 1;
};
    
function getNumberOfDaysPerMonth(month, year) {
    let dayOfMonth;
    year = correctionYear(year);
    month = Number(month);
    if (month < 8){
        if (month !== 2) {
            dayOfMonth = CONSTANTS.NUM_DAYS_OF_SMALL_MONTHS + (month % 2);             
        } else dayOfMonth = checkLeapYear(year) ? CONSTANTS.NUM_DAYS_OF_BIG_FEBRUARY : CONSTANTS.NUM_DAYS_OF_SMALL_FEBRUARY;
    } else dayOfMonth = CONSTANTS.NUM_DAYS_OF_BIG_MONTHS - (month % 2);
    return dayOfMonth;
};

function makeTable(firstDay, numberOfDays) {
    let table = top;
    let counterNum = 1;
    for (let i = 1; i < firstDay; i++){
        table += '  ' + betweenColumns;
    }
    for (let i = firstDay; i <= CONSTANTS.NUM_CALENDAR_CELLS; i++) {
      let lastDay = numberOfDays + firstDay;
      table = table + ((counterNum < CONSTANTS.NUMBER_OF_DIGIT) ? '0' : '') + (( i >= lastDay) ? '  ': counterNum) 
      + (((i % CONSTANTS.NUMBER_DAYS_OF_WEEK === 0) && (i/CONSTANTS.NUMBER_DAYS_OF_WEEK !== 6)) ? betweenLines : betweenColumns);
      counterNum++;
    }
    table += '.' + bottom;
    return table;
}
  
function makeCurrentTable(month, year) {
    let correction = correctionLeapYear(year, month);
    let codeMonth = getMonthCode(month);
    let codeYear = getYearCode(year);
    let numberOfDays = getNumberOfDaysPerMonth(month, year);
    let firstDay = getDayOfWeek(CONSTANTS.STRING_FIRST_NUMBER, correction, codeMonth, codeYear);
    return makeTable(firstDay, numberOfDays);
}

module.exports = { makeCurrentTable };

let top = `┌───  ────  ─────  ─────  ────  ───┐.
│ ПН    ВТ    СР    ЧТ    ПТ    СБ     НД │.
├─   ─┬─   ─┬─   ─┬─   ─┬─   ─┬─   ─┬─   ─┤.
│ `
let betweenLines = `  │.
├─   ─┼─   ─┼─   ─┼─   ─┼─   ─┼─   ─┼─   ─┤.
│ `;

let bottom = `
└─   ─┴─   ─┴─   ─┴─   ─┴─   ─┴─   ─┴─   ─┘.
`;
let betweenColumns = '  │ ';
