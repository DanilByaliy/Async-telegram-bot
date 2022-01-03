let mons = [1, 4, 4, 0, 2, 5, 0, 3, 6, 1, 4, 6];
    
function getCodeMons(value) {
    let code = mons[Number(value) - 1];
    return code;
};
    
function getCodeYear(value) {
    let index = (3 - (value.slice(0, 2) % 4)) * 2;
    let twoNum = (Number(value.slice(2)));
    let code = ((index + twoNum + Math.floor(twoNum/4)) % 7);
    return code;
};
    
function checkLeapYear(value) {
    if ((value % 4 === 0 && value % 100 !== 0) || (value % 4 === 0 && value % 400 === 0)) {
        return true;
    } 
    return false;
};
    
function correctionLeapYear(year, numberMons) {
    let correction = 0;
    if (checkLeapYear(year) && Number(numberMons) < 3) {
        correction = -1;
    };
return correction;
};
    
function getDay(value, correction, codeMons, codeYear) {
    let day = (correction + Number(value) + codeMons + codeYear) % 7;
    day = ((day + 5) % 7) + 1;
    return day;
};
    
function getDayOfMonth(month, year) {
    let dayOfMonth;
    month = Number(month);
    if (month < 8){
        if (month !== 2) {
            dayOfMonth = 30 + (month % 2);             
        } else dayOfMonth = checkLeapYear(year) ? 29 : 28;
    } else dayOfMonth = 31 - (month % 2);
    return dayOfMonth;
};

function makeTable(a, n) {
    let a51 = g11;
    for (let i = 1; i < a; i++){
      a51 = a51 + '  ' + b;
    }
    for (let i = a; i <= 42; i++) {
      let s = i - a + 1;
      let se = n + a - 1;
      a51 = a51 + ((s < 10) ? '0' : '') + (( i > se) ? '  ': s) + (((i % 7 === 0) && (i/7 !== 6)) ? g2 : b) ;
    }
    a51 = a51 + '.' + g3;
    return a51;
}
  
function makeCurrentTable(mon, yearCur) {
    let year = ((yearCur.length < 3) ? '00' : '') + yearCur;
    let correction = correctionLeapYear(year, mon);
    let codeMons = getCodeMons(mon);
    let codeYear = getCodeYear(year);
    let i = getDayOfMonth(mon, year);
    let u = getDay('01', correction, codeMons, codeYear);

    return makeTable(u, i);
}

module.exports = { makeCurrentTable };

let g11 = `┌───  ────  ─────  ─────  ────  ───┐.
│ ПН    ВТ    СР    ЧТ    ПТ    СБ     НД │.
├─   ─┬─   ─┬─   ─┬─   ─┬─   ─┬─   ─┬─   ─┤.
│ `
let g2 = `  │.
├─   ─┼─   ─┼─   ─┼─   ─┼─   ─┼─   ─┼─   ─┤.
│ `;

let g3 = `
└─   ─┴─   ─┴─   ─┴─   ─┴─   ─┴─   ─┴─   ─┘.
`;
let b = '  │ ';