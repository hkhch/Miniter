/***************************************************************
 * 파일명 : common.js
 * 작성일 : 2019. 08. 04
 * 작성자 : 한광훈
 * 내  용 : 모든 모듈에서 사용되는 일반적인 기능의 변수, 함수 및 클래스
 ***************************************************************/

 /***************************************************************
 * HTML관련 자료구조
***************************************************************/
const TAG = {
    div: "div",
    span: "span",
    ul: "ul",
    li: "li",
    input: "input",
    button: "button",
    hr: "hr"
};


/***************************************************************
 * DEBUGGING을 위한 변수, 함수 및 클래스
***************************************************************/
const DEBUGGING_MODE = 0;    // DEBUGGING MODE 선택 (0:구동모드, 1:디버깅모드)
const CONSOLE_MODE = 0;      // DEBUGGING MODE에서 Console Log를 찍고 싶은 경우

let THIS_LINE = () => {return new Error().lineNumber;}  // 현재의 코드 줄번호 (추후 추가)
let THIS_STACK = () => {return new Error().stack;}      // 현재의 코드 행번호 (추후 추가)
const FUNC_DEBUGGING = (consoleLog) => {
    // CONSOLE MODE
    if(CONSOLE_MODE){
        console.log(`메시지 : ${consoleLog}`);
    }
    // DEBUGGING MODE
    if(DEBUGGING_MODE){
        debugger;
    }
};


/***************************************************************
 * STORAGE관련 자료구조
***************************************************************/
const SESSION_STORAGE = {
    CURRENT_LOGIN_USER: "CURRENT_LOGIN_USER"
};


/***************************************************************
 * VIEW관련 자료구조
***************************************************************/
const MAIN_PAGE = "../../index.html";


/***************************************************************
 * 사용자 MEMEBR 함수 정의
***************************************************************/
Number.prototype.padLeft = function() {
    if(this < 10) {
        return '0' + String(this);
    }
    else {
        return String(this);
    }
}

Date.prototype.format = function() {
    var yyyy = this.getFullYear();
    var month = (this.getMonth() + 1).padLeft();
    var dd = this.getDate().padLeft();
    var HH = this.getHours().padLeft();
    var mm = this.getMinutes().padLeft();
    var ss = this.getSeconds().padLeft();

    var format = [yyyy, month, dd].join('-') + ' ' + [HH, mm, ss].join(':');
    return format;
}


/***************************************************************
 * COMMON CLASS
***************************************************************/
class Common {
    constructor(){
        // 공통된 맴버변수 추가
    }

    // 공통된 맴버함수 추가
    DisplayMsg(displayMsg){
        // 추후 별도의 인터페이스 Element구성
        alert(displayMsg);
    }
};

