/***************************************************************
 * 파일명 : signup.js
 * 작성일 : 2019. 08. 02
 * 작성자 : 한광훈
 * 내  용 : Signup Body Class
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
const ERROR_MESSAGE = {
    ID_PW_WRONG: "입력하신 데이터가 올바르지 않습니다. 확인부탁드립니다.",
};

const ALARM_MESSAGE = {
    THERE_IS_NOT: "존재하지 않는 ID입니다."
};

const BODY_INPUT_ID = {
    ENTER_ID: 0,        // ENTER ID INPUT
    NAME: 1,            // NAME INPUT
    PASSWORD: 2,        // PASSWORD INPUT
    REPASSWORD: 3,      // REPASSWORD INPUT
    PROFILE:4,          // PROFILE INPUT
};



/***************************************************************
 * SIGNUPBODY CLASS
***************************************************************/
// SignUpBody Class 선언부
class SignUpBody {
    // 0. 생성자
    constructor(cServerInterface){
        this.m_eEnterID = null;
        this.m_eName = null;
        this.m_ePassword = null;
        this.m_eRePassword = null;
        this.m_eProfile = null;
        this.m_cServerInterface = cServerInterface;

        // InputElement생성
        this.createElement();
    }

    createElement(){
        let eSignUpBodyParents = document.getElementById("INPUT_CONTAINER");
        this.m_eEnterID = new ESmartInput(eSignUpBodyParents, "text", "Enter ID", this.onKeyupForEnterID.bind(this));
        this.m_eName = new ESmartInput(eSignUpBodyParents, "text", "Enter Name", this.onKeyupForName.bind(this));
        this.m_ePassword = new ESmartInput(eSignUpBodyParents, "password", "Password", null);
        this.m_eRePassword = new ESmartInput(eSignUpBodyParents, "password", "Password", null);
        this.m_eProfile = new ESmartInput(eSignUpBodyParents, "text", "Profile", null);

        // KEY UP 이벤트 발생시 Element Event Handler Callback함수 설계시 사용 (추후 진행예정)
        this.eSignUpComplete = document.getElementById("SIGNUP_COMPLETE");
        this.eSignUpDelete = document.getElementById("SIGNUP_DELETE");
        this.eSignUpCancel = document.getElementById("SIGNUP_CANCEL");
    }

    // 0. MEMBER FUNCTION 선언 and 정의
    getElementValue(bodyInputId){
        let returnValue = "";
    
        switch(bodyInputId){
        case BODY_INPUT_ID.ENTER_ID:
            returnValue = this.m_eEnterID.getValue();
            break;
        case BODY_INPUT_ID.NAME:
            returnValue = this.m_eName.getValue();
            break;
        case BODY_INPUT_ID.PASSWORD:
            returnValue = this.m_ePassword.getValue();
            break;
        case BODY_INPUT_ID.REPASSWORD:
            returnValue = this.m_eRePassword.getValue();
            break;
        case BODY_INPUT_ID.PROFILE:
            returnValue = this.m_eProfile.getValue();
            break;
        default:
            break;
        }

        return returnValue;
    }

    clearElementValue(bodyInputId){
        // 다른 방법으로 구현 (교육용 (위에서 정의된 순서를 프로그래머가 알고 있어야 한다는 단점이 있음))
        const INPUT_ELEMENT = [ 
            this.m_eEnterID, this.m_eName, this.m_ePassword, this.m_eRePassword, this.m_eProfile
        ];

        INPUT_ELEMENT[bodyInputId].ClearValue();
    }

    setElementValue(bodyInputId, setData){
        // 다른 방법으로 구현 (교육용 (위에서 정의된 순서를 프로그래머가 알고 있어야 한다는 단점이 있음))
        const INPUT_ELEMENT = [ 
            this.m_eEnterID, this.m_eName, this.m_ePassword, this.m_eRePassword, this.m_eProfile
        ];

        INPUT_ELEMENT[bodyInputId].setValue(setData);  
    }

    // 1. EVENT HANDLER 선언 and 정의
    onKeyupForEnterID(){
        let signUpUserID = this.getElementValue(BODY_INPUT_ID.ENTER_ID);

        // signUpUserID가 이미 존재하는 경우 Complete버튼을 Modify용으로 변경하고 Delete버튼을 보여준다.
        signUpUserID.trim();
        let isThereAlreadySignUpID = this.m_cServerInterface.IsThereSignUpID(signUpUserID);
 
        // ENTER ID에 따라서 버튼용도 결정 (여기에서는 단순히 버튼 TEXT만 변경함)
        if(isThereAlreadySignUpID === true){
            let UserData = this.m_cServerInterface.SearchSignUpData(signUpUserID);
            this.eSignUpComplete.innerHTML = "MODIFY";
            this.eSignUpDelete.style.display = "inline";

            // SIGN UP ELEMENT에 값 채우기
            // this.m_eEnterID.m_eTHIS.disabled = true;
            this.m_eName.setValue(UserData[STORAGE_DATA_INDEX.NAME]);
            // this.m_ePassword.setValue(UserData[STORAGE_DATA_INDEX.PW]);
            // this.m_eRePassword.setValue(UserData[STORAGE_DATA_INDEX.PW]);
            this.m_eProfile.setValue(UserData[STORAGE_DATA_INDEX.PROFILE]);
        }
        else{
            this.eSignUpComplete.innerHTML = "SIGN UP";
            this.eSignUpDelete.style.display = "none";

            // SIGN UP ELEMENT에 값 채우기
            this.m_eName.setValue("");
            this.m_ePassword.setValue("");
            this.m_eRePassword.setValue("");
            this.m_eProfile.setValue("");
        }
    }

    onKeyupForName(){
        // 테스트 용으로 바인딩 시킴
    }
};

// LoginBody Class 정의부
const GlobalESignUpBody = new SignUpBody(GlobalServerDataCtrl);



/***************************************************************
 * 파일명 : signup.js
 * 작성일 : 2019. 08. 02
 * 작성자 : 한광훈
 * 내  용 : Signup Ctrl Class (Button Event 및 로그인 상태 등 Control관련 Class)
 * 설  명 : 생성자 인자 : completeBtnID(Complete Button CSS Selector),
 *                       deleteBtnID(Delete Button CSS Seleter),
 *                       cancelBtnID(Cancle Button CSS Selector),
 *                       cServerInterface(TestServer Interface Class Reference)
 * 비  고 : eSmartInput.js 파일이 INCLUDE되어야 함 (실패)
 *         생성자 인자 : completeBtnID
 ***************************************************************/
// Signup Control Class 선언부
class SignUpCtrl extends Common {
    // 0. 생성자
    constructor(completeBtnID, deleteBtnID, cancelBtnID, cSignUpBody, cServerInterface){
        // Parentes 생성자 호출
        super();
        this.m_eCompleteBtn = document.getElementById(completeBtnID);
        this.m_eDeleteBtn = document.getElementById(deleteBtnID);
        this.m_eCancelBtn = document.getElementById(cancelBtnID);
        this.m_cSignUpBody = cSignUpBody;
        this.m_cServerInterface = cServerInterface;

        // Button Element생성
        this.createElement();
    }

    createElement(){
       // 추후 Button Element 생성 및 CSS 설정 예정 (Configuration Data를 인자나 Lookup Table로 관리)
       // Event Handler Binding
       this.m_eCompleteBtn.onclick = this.OnClickEventOnCompleteBtn.bind(this);
       this.m_eDeleteBtn.onclick = this.OnClickEventOnDeleteBtn.bind(this);
       this.m_eCancelBtn.onclick = this.OnClickEventOnCancelBtn.bind(this);
    }

    // 1. Event Handler 정의부
    OnClickEventOnCompleteBtn(){
        // 현재 입력 데이터 무결성 체크
        let userID = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.ENTER_ID);
        let userName = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.NAME);
        let userPW = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.PASSWORD);
        let userRePW = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.REPASSWORD);
        let userProfile = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.PROFILE);

        // 예외사항 처리 (데이터 무결성 체크)
        if(this.checkInputData(userID) || this.checkInputData(userName) || 
           this.checkInputData(userPW) || this.checkInputData(userRePW) || this.checkInputData(userProfile)){
            this.DisplayMsg(ERROR_MESSAGE.ID_PW_WRONG);
            return;
        }
        // PASSWORD 데이터 무결성 체크
        if(userPW !== userRePW){
            this.DisplayMsg(ERROR_MESSAGE.ID_PW_WRONG);
            return;
        }

        // 현재 userID가 Signup된 고객인지 확인 (이 기준에 따라 신규등록 or 수정작업 진행)
        // 분류하여 데이터 저장 정책에 따라 별도 이벤트발생 (추후 진행예정)
        let isThereAlreadyUser = this.m_cServerInterface.IsThereSignUpID(userID);

        // 0. 이미 ID가 존재하는 경우 MODIFY 작업진행
        if(isThereAlreadyUser === true){
            // Server 작업 완료 상태를 체크해야 함 (추후체크)
            this.m_cServerInterface.ModifySignUpData(userID, userName, userPW, userProfile);
            this.refreshSignUpBody();
        }
        // 1. 신규 ID인 경우 INSERT 작업진행
        else if(isThereAlreadyUser === false){
            // Server 작업 완료 상태를 체크해야 함 (추후체크)
            let result = this.m_cServerInterface.InsertSignUpData(userID, userName, userPW, userProfile);
            this.refreshSignUpBody();
        }
    };

    // EVENT HANDLER 정의
    OnClickEventOnDeleteBtn(){
        // 현재 입력 데이터 무결성 체크
        let userID = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.ENTER_ID);
        let userPW = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.PASSWORD);
        let userRePW = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.REPASSWORD);

        // 예외사항 처리 (데이터 무결성 체크)
        if(this.checkInputData(userID) || this.checkInputData(userPW) || this.checkInputData(userRePW)){
            this.DisplayMsg(ERROR_MESSAGE.ID_PW_WRONG);
            return;
        }
        // PASSWORD 데이터 무결성 체크
        if(userPW !== userRePW){
            this.DisplayMsg(THERE_IS_NOT.THERE_IS_NOT);
            return;
        }

        let isThereAlreadyUser = this.m_cServerInterface.IsThereSignUpID(userID);

        // 0. ID가 존재하는 경우 DELETE 작업진행
        if(isThereAlreadyUser === true){
            // Server 작업 완료 상태를 체크해야 함 (추후체크)
            this.m_cServerInterface.DeleteSignUpData(userID);
            this.clearElements();
            this.refreshSignUpBody();
        }
        // 1. ID가 존재하지 않는 경우 MESSAGE창 표시
        else if(isThereAlreadyUser === false){
            // Server 작업 완료 상태를 체크해야 함 (추후체크)
            this.DisplayMsg(ERROR_MESSAGE.ID_PW_WRONG);
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
    checkInputData(data){
        let returnValue = 0; // 0 : 정상, 1이상 : 비정상

        // 데이터 전처리
        data.trim();

        // 데이터 체크항목 확인
        if(data === ""){
            returnValue = 1;    // ERROR_CODE_1 : 데이터가 입력되지 않은 경우
        } 
        // 체크항목이 있는 경우 이 곳에 추가
        /*
        else if(){
        }
        */

        return returnValue;
    }

    refreshSignUpBody(){
        let signUpUserID = this.m_cSignUpBody.getElementValue(BODY_INPUT_ID.ENTER_ID);

        // signUpUserID가 이미 존재하는 경우 Complete버튼을 Modify용으로 변경하고 Delete버튼을 보여준다.
        signUpUserID.trim();
        let isThereAlreadySignUpID = this.m_cServerInterface.IsThereSignUpID(signUpUserID);
 
        // ENTER ID에 따라서 버튼용도 결정 (여기에서는 단순히 버튼 TEXT만 변경함)
        if(isThereAlreadySignUpID === true){
            let UserData = this.m_cServerInterface.SearchSignUpData(signUpUserID);
            this.m_eCompleteBtn.innerHTML = "MODIFY";
            this.m_eDeleteBtn.style.display = "inline";

            // SIGN UP ELEMENT에 값 채우기
            this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.NAME, UserData[STORAGE_DATA_INDEX.NAME]);
            // this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.PASSWORD., BODY_INPUT_ID.UserData[STORAGE_DATA_INDEX.PW]);
            // this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.REPASSWORD, UserData[STORAGE_DATA_INDEX.PW]);
            this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.PROFILE, UserData[STORAGE_DATA_INDEX.PROFILE]);
        }
        else{
            this.m_eCompleteBtn.innerHTML = "SIGN UP";
            this.m_eDeleteBtn.style.display = "none";

            // SIGN UP ELEMENT에 값 채우기
            this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.NAME, "");
            this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.PASSWORD, "");
            this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.REPASSWORD, "");
            this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.PROFILE, "");
        }
    }

    clearElements(){
        // ELEMENT VALUE CLEAR
        this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.ENTER_ID, "");
        this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.NAME, "");
        this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.PASSWORD, "");
        this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.REPASSWORD, "");
        this.m_cSignUpBody.setElementValue(BODY_INPUT_ID.PROFILE, "");
    }
};

// LoginBody Class 정의부
const GlobalESignUpCtrl = new SignUpCtrl("SIGNUP_COMPLETE", "SIGNUP_DELETE", "SIGNUP_CANCEL", GlobalESignUpBody, GlobalServerDataCtrl);

