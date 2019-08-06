/***************************************************************
 * 파일명 : login.js
 * 작성일 : 2019. 08. 02
 * 작성자 : 한광훈
 * 내  용 : Login Body Class
 * 비  고 : eSmartInput.js 파일이 INCLUDE되어야 함 (실패)
 ***************************************************************/

/***************************************************************
 * 모듈 INCLUDE
***************************************************************/
// 파일 INCLUDE (모듈화 실패 JS파일의 IMPORT/EXPORT가 되지 않음)
// document.write("<script type='text/javascript' src='./4. Utility/eSmartInput.js'><"+"/script>");
// document.write("<script src='./4. Utility/eSmartInput.js'></script>");
// import { ESmartInput } from './eSmartInput.js';
// import * as eSmartInput from "./eSmartInput.js";
// import ESmartInput from './eSmartInput.js';

/***************************************************************
 * 사용자 정의 자료구조 (Abstract Data Type)
***************************************************************/
const LOGIN_STATUS = {
    // LOGIN 상태
    OFF: 0,       // LOG OFF
    NO: 1,        // LOG ON
};

const ERROR_MESSAGE = {
    ID_PW_WRONG: "입력하신 데이터가 올바르지 않습니다. 확인부탁드립니다.",
};

const ALARM_MESSAGE = {
    ALREADY_LOGIN: "이미 로그인 상태입니다.",
    NO_ENTRANCE_USER: "회원가입이 필요합니다."
};



/***************************************************************
 * LOGINBODY CLASS
***************************************************************/
// LoginBody Class 선언부
class LoginBody {
    // 0. 생성자
    constructor(){
        // Private Member 변수 (Event Handler에서 사용해야 해서 일단 Public 변수로 전환)
        // let m_eEnterID = null;
        // let m_ePassword = null;
        this.m_eEnterID = null;
        this.m_ePassword = null;

        // InputElement생성
        this.createElement();
    }

    createElement(){
        let eLoginBodyParents = document.getElementById("INPUT_CONTAINER");
        this.m_eEnterID = new ESmartInput(eLoginBodyParents, "text", "Enter ID", null);
        this.m_ePassword = new ESmartInput(eLoginBodyParents, "password", "Password", null);

        // KEY UP 이벤트 발생시 Element Attribute와 CSS Property 수정시 사용 (추후 적용예정)
        this.eLoginComplete = document.getElementById("LOGIN_COMPLETE");
        this.eLoginCancel = document.getElementById("LOGIN_CANCEL");
    }

    // 1. EnterID INPUT ELEMENT
    getEnterIDElementValue(){
        return this.m_eEnterID.getValue();
    }

    clearEnterIDElementValue(){
        this.m_eEnterID.ClearValue();
    }

    setEnterIDElementValue(setData){
        this.m_eEnterID.setValue(setData);
    }

    // 2. Password INPUT ELEMENT
    getPasswordElementValue(){
        return this.m_ePassword.getValue();
    }

    clearPasswordElementValue(){
        return this.m_ePassword.ClearValue();
    }

    setPasswordElementValue(setData){
        this.m_ePassword.setValue(setData);
    }
};

// LoginBody Class 정의부
const GlobalELoginBody = new LoginBody();



/***************************************************************
 * 파일명 : login.js
 * 작성일 : 2019. 08. 02
 * 작성자 : 한광훈
 * 내  용 : Login Ctrl Class (Button Event 및 로그인 상태 등 Control관련 Class)
 * 설  명 : 생성자 인자 : completeBtnID(Complete Button CSS Selector),
 *                       cancelBtnID(Cancle Button CSS Selector),
 *                       cServerInterface(TestServer Interface Class Reference)
 * 비  고 : eSmartInput.js 파일이 INCLUDE되어야 함 (실패)
 *         생성자 인자 : completeBtnID
 ***************************************************************/
// Login Control Class 선언부
class LoginCtrl extends Common {
    // 0. 생성자
    constructor(completeBtnID, cancelBtnID, cLoginBody, cServerInterface){
        // Parentes 생성자 호출
        super();
        this.m_eCompleteBtn = document.getElementById(completeBtnID);
        this.m_eCancelBtn = document.getElementById(cancelBtnID);
        this.m_cLoginBody = cLoginBody;
        this.m_cServerInterface = cServerInterface;
        this.m_statusOfLogIn = LOGIN_STATUS.OFF;
        this.m_logInId = "";

        // Button Element생성
        this.createElement();
    }

    createElement(){
       // 추후 Button Element 생성 및 CSS 설정 예정 (Configuration Data를 인자나 Lookup Table로 관리)
       // Event Handler Binding
       this.m_eCompleteBtn.onclick = this.OnClickEventOnCompleteBtn.bind(this);
       this.m_eCancelBtn.onclick = this.OnClickEventOnCancelBtn.bind(this);

       // 작업의 용이함을 위해 sessionStorage에 현재 로그인 정보저장 (Client 입장)
        let currentLoginUser = window.sessionStorage.getItem(SESSION_STORAGE.CURRENT_LOGIN_USER);
        if(currentLoginUser == null){
            this.clearSessionStorage(SESSION_STORAGE.CURRENT_LOGIN_USER);
            this.m_eCompleteBtn.innerHTML = "LOG IN";
        }
        else{
            currentLoginUser.trim();
            let isThereLotinID = this.m_cServerInterface.IsThereLogInID(currentLoginUser);
            if(isThereLotinID === true){
                // 이미로그인 상태이면 로그아웃환경으로 전환
                this.m_cLoginBody.m_eEnterID.m_eTHIS.disabled = true;
                this.m_cLoginBody.m_ePassword.m_eTHIS.disabled = true;
                let currentLogInUserData = this.m_cServerInterface.SearchSignUpData(currentLoginUser);
                this.m_statusOfLogIn = LOGIN_STATUS.ON;
                this.m_logInId = currentLoginUser;
                this.m_cLoginBody.setEnterIDElementValue(currentLogInUserData[STORAGE_DATA_INDEX.ID]);
                this.m_cLoginBody.setPasswordElementValue(currentLogInUserData[STORAGE_DATA_INDEX.PW]);
                this.m_eCompleteBtn.innerHTML = "LOG OUT";
            }
        }

    }

    // 1. Event Handler 정의부
    OnClickEventOnCompleteBtn(){
        // 현재 입력 데이터 무결성 체크
        let userID = this.m_cLoginBody.getEnterIDElementValue();
        let userPW = this.m_cLoginBody.getPasswordElementValue();

        // 예외사항 처리 (데이터 무결성 체크)
        if((userID.trim() === "") || (userPW.trim() === "")){
            this.DisplayMsg(ERROR_MESSAGE.ID_PW_WRONG);
            return;
        }

        // 0. 로그인 상태인 경우
        if(this.m_statusOfLogIn === LOGIN_STATUS.ON){
            // 현재 사이트에 누군가의 로그인 상태이면 로그아웃 시키고 신규 로그인 작업 진행 (프로세스의 간략화를 위해 제한적인 기능 구현)
            // Server Log Out 신청 (일단동기처리)
            // Server 작업상태에 따라 Client쪽 작업 상태 변경 (추후 예외처리)
            this.m_cServerInterface.LogOut(this.m_logInId);
            this.setLogoutStatus(this.m_logInId);
        }
        // 1. 로그오프 상태인 경우
        else if(this.m_statusOfLogIn === LOGIN_STATUS.OFF){
            // 1. 로그인 작업이 필요한 상태인 경우 로그인시킴
            if((userID.trim() === "") || (userPW.trim() === "")){
                this.DisplayMsg(ERROR_MESSAGE.ID_PW_WRONG);
            }
            else{
                let isIDOK = this.m_cServerInterface.CheckPassword(userID, userPW);
                // SERVER와 PASSWORD가 일치하지 않음
                if(isIDOK === 0){
                    this.DisplayMsg(ERROR_MESSAGE.ID_PW_WRONG);
                }
                // SERVER와 PASSWORD가 일치
                else if(isIDOK === 1){
                    this.m_cServerInterface.LogIn(userID);
                    this.setLoginStatus(userID);
                }
                // 회원 가입하지 않은 고객
                else if(isIDOK === 2){
                    this.DisplayMsg(ALARM_MESSAGE.NO_ENTRANCE_USER);
                }
            }
        }
    };

    // EVENT HANDLER 정의
    OnClickEventOnCancelBtn(){
        location.href = MAIN_PAGE;
    };

    // SESSIONSTORAGE SAVE or DELETE
    saveSessionStorage(sessionStorageID, setValue){
        window.sessionStorage.setItem(sessionStorageID, setValue);
    }

    clearSessionStorage(sessionStorageID){
        window.sessionStorage.setItem(sessionStorageID, []);
    }

    // 내부함수
    setLoginStatus(ID){
        // 설정값 변경되지 않도록 LOCK (데이터 무결성을 위해 Private으로 변경후 Interface만 열어 줘야 함 (추후진행))
        this.m_cLoginBody.m_eEnterID.m_eTHIS.disabled = true;
        this.m_cLoginBody.m_ePassword.m_eTHIS.disabled = true;
        // Element설정
        this.m_eCompleteBtn.innerHTML = "LOG OUT";
        // 내부변수 설정
        this.m_statusOfLogIn = LOGIN_STATUS.ON;
        this.m_logInId = ID;
        // 외부메모리 설정
        this.saveSessionStorage(SESSION_STORAGE.CURRENT_LOGIN_USER, ID);
    }

    setLogoutStatus(ID){
        // 설정값 변경되지 않도록 LOCK (데이터 무결성을 위해 Private으로 변경후 Interface만 열어 줘야 함 (추후진행))
        this.m_cLoginBody.m_eEnterID.m_eTHIS.disabled = false;
        this.m_cLoginBody.m_ePassword.m_eTHIS.disabled = false;
        // Element설정
        this.m_eCompleteBtn.innerHTML = "LOG IN";
        // 내부변수 설정
        this.m_statusOfLogIn = LOGIN_STATUS.OFF;
        this.m_logInId = "";
        // 외부메모리 설정
        this.clearSessionStorage(SESSION_STORAGE.CURRENT_LOGIN_USER);
        this.m_cLoginBody.setEnterIDElementValue("");
        this.m_cLoginBody.setPasswordElementValue("");
    }
};

// LoginBody Class 정의부
const GlobalELoginCtrl = new LoginCtrl("LOGIN_COMPLETE", "LOGIN_CANCEL", GlobalELoginBody, GlobalServerDataCtrl);

