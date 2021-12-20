let mons = [1, 4, 4, 0, 2, 5, 0, 3, 6, 1, 4, 6];
let text = msg; 
let [numberMons, year] = text.split('.');
year = ((year.length < 3) ? '00' : '') + year;
let correction = correctionLeapYear(year);
let codeMons = getCodeMons(numberMons);
let codeYear = getCodeYear(year);
    
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
    
function correctionLeapYear(year) {
    let correction = 0;
    if (checkLeapYear(year) && Number(numberMons) < 3) {
        correction = -1;
    };
return correction;
};
    
function getDay(value) {
    let day = (correction + Number(value) + codeMons + codeYear) % 7;
    day = ((day + 5) % 7) + 1;
    return day;
};
    
function getDayOfMonth(month) {
    let dayOfMonth;
    month = Number(month);
    if (month < 8){
        if (month !== 2) {
            dayOfMonth = 30 + (month % 2);             
        } else dayOfMonth = checkLeapYear(year) ? 29 : 28;
    } else dayOfMonth = 31 - (month % 2);
    return dayOfMonth;
};