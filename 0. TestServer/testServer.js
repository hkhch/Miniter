/***************************************************************
 * 파일명 : TestServer.js
 * 작성일 : 2019. 08. 02
 * 작성자 : 한광훈
 * 내  용 : Test Server Class (storage : localStorage이용)
 * 설  명 : 
 * 비  고 : Data Class와 Data Interface Class를 불리하여 Data보호
 ***************************************************************/

/***************************************************************
 * 사용자 정의 자료구조 (Abstract Data Type)
***************************************************************/
const STORAGE_DATA_INDEX = {
    // STORAGE에 저장되는 DATA 패킷 순서
    ID: 0,          // 사용자 ID
    NAME: 1,        // 사용자 이름
    PW: 2,          // 사용자 PASSWORD
    PROFILE: 3,     // 사용자 PROFILE
    MAX_INDEX: 4,   // STORAGE_MAX_DATA_INDEX
};

const STOREAGE_ID = {
    // LOCALSTORAGE (영구적인 메모리)
    SIGNUP_DATA: "SIGNUP_DATA",     // localStorage에 저장되는 KEY VALUE FOR SIGNUP DATA
    LOGIN_DATA: "LOGIN_DATA",       // localStorage에 저장되는 KEY VALUE FOR LOGIN DATA
    MINITER_DATA: "MINITER_DATA",   // localStorage에 저장되는 KEY VALUE FOR MINITER DATA

    // SECSSIONSTORAGE (사이트가 활성화된 동안만 살아있는 메모리)
    READY_STORAGE: "READY_STORAGE", // 사이트가 활동화된 가장 처음에만 설정되는 메모리
};

const MINITER_DATA_INDEX = {
    USER_ID: 0,    // Miniter DATA 배열 INDEX
    CONTENTS: 1,   // MINITER DATA CONTENTS
};

const CONTENTS_INDEX = {
    CONTENT: 0,     // CONTENT INDEX
    DATE: 1,        // DATE INDEX
    USER: 2,        // USER
    MAX_INDEX: 3,
};

const MINITER_DATA_ENCODE_MASK = "INTERVAL"; // localStorage가 1차원 배열밖에 저장되지 않아 USER간 데이터 구분자로 이용



/***************************************************************
 * DATA CLASS 선언부
***************************************************************/
class ServerData {
    // 0. 생성자
    constructor(){
        this.m_eSignUpData = [];
        this.m_eLogInData = [];
        this.m_eMiniterData = [];

        // Server Data 생성
        this.createData();
    }

    createData(){
        FUNC_DEBUGGING("ServerData 생성");

        // 서버생성 동기를 맞추기 위해서 SESSIONSTORGE이용 (임시로 처리)
        const CHECK_READY_STORAGE = window.sessionStorage.getItem(STOREAGE_ID.READY_STORAGE);
        if(CHECK_READY_STORAGE == null){
            // 사이트가 처음 호출된 경우
            window.sessionStorage.setItem(STOREAGE_ID.READY_STORAGE, "1");

            // 처음 사이트에 들어오는 경우 LOGIN STORAGE를 삭제
            window.localStorage.removeItem(STOREAGE_ID.LOGIN_DATA);
        }

        // 1. 처음 생성 시 Storage를 참고하여 Data Structure 재구성
        // 1.1 Sign up Data처리부
        let isThereSignUpDataToStorage = window.localStorage.getItem(STOREAGE_ID.SIGNUP_DATA);
        if(isThereSignUpDataToStorage === null){
            // localStorage에 Data구조가 없는 경우 Default Data를 이용하여 데이터 섹션을 만든다.
            let storageDataForSaving = [];
            storageDataForSaving = this.ConvertServerSignUpDataToStorage(DEFAULT_SIGNUP_DATA);
            window.localStorage.setItem(STOREAGE_ID.SIGNUP_DATA, storageDataForSaving);
            this.m_eSignUpData = this.copyServerSignUpData(DEFAULT_SIGNUP_DATA);
        }
        // 이미 Storage가 존재하는 경우 Upload실행
        else{
            this.UpdateSignUpDataFromStorage();
        }

        // 1.2 Login Data 처리부 (웹사이트 OFF시 자동소멸)
        let isThereLoginDataToStorage = window.localStorage.getItem(STOREAGE_ID.LOGIN_DATA);
        if(isThereLoginDataToStorage === null){
            let storageDataForSaving = [];
            window.localStorage.setItem(STOREAGE_ID.LOGIN_DATA, storageDataForSaving);
            this.m_eLogInData = storageDataForSaving;
        }
        // 이미 Storage가 존재하는 경우 Upload실행
        else{
            this.UpdateLogInDataFromStorage();
        }

        // 1.3 Miniter Data 처리부
        let isThereMiniterDataToStorage = window.localStorage.getItem(STOREAGE_ID.MINITER_DATA);
        if(isThereMiniterDataToStorage === null){
            let storageDataForSaving = [];
            storageDataForSaving = this.ConvertServerMiniterDataToStorage(DEFAULT_MINITER_DATA);
            window.localStorage.setItem(STOREAGE_ID.MINITER_DATA, storageDataForSaving);
            this.m_eMiniterData = storageDataForSaving;
        }
        // 이미 Storage가 존재하는 경우 upload실행
        else{
            this.UpdateMiniterDataFromStorage();
        }

    }

    // 1. Sign Up Data처리부
    // localStorage에 저장할 수 있는 데이터 형태로 가공 (1차배열 형식만 가능 (객체는 저장되지 않음))
    ConvertServerSignUpDataToStorage(serverSignUpData){
        let storageData = [];
        let indexSelector = 0;
        
        for(let index=0; index<serverSignUpData.length; index++){
            storageData[indexSelector++] = serverSignUpData[index][STORAGE_DATA_INDEX.ID];        // 사용자 ID
            storageData[indexSelector++] = serverSignUpData[index][STORAGE_DATA_INDEX.NAME];      // 사용자 이름
            storageData[indexSelector++] = serverSignUpData[index][STORAGE_DATA_INDEX.PW];        // 사용자 PASSWORD
            storageData[indexSelector++] = serverSignUpData[index][STORAGE_DATA_INDEX.PROFILE];   // 사용자 PROFILE
        }

        return storageData;
    }
    // localStorage에서 읽어온 데이터를 Server에서 처리하게 데이터 가공 (2차원 배열 (데이터 복사를 위해 객체형태 배제))
    ConvertStorageToServerSignUpData(storageData){
        let storageDataArray = [];
        let serverSignUpData = [];
        let user = [];
        let indexSelector = 0;

        // DECODING 작업
        storageDataArray = storageData.split(",");
        
        for(let index=0; index<storageData.length; index=index+STORAGE_DATA_INDEX.MAX_INDEX){
            // 예외처리
            if(typeof(storageDataArray[index]) === "undefined") continue; // 추후 확인 한 후 break;로 전환
            // 데이터 DECODING작업
            let user = [];
            user.push(storageDataArray[index + STORAGE_DATA_INDEX.ID],           // 사용자 ID
                      storageDataArray[index + STORAGE_DATA_INDEX.NAME],         // 사용자 이름
                      storageDataArray[index + STORAGE_DATA_INDEX.PW],           // 사용자 PASSWORD
                      storageDataArray[index + STORAGE_DATA_INDEX.PROFILE]);     // 사용자 PROFILE
            serverSignUpData[indexSelector] = user;
            indexSelector++;
        }

        return serverSignUpData;
    }
    // 데이터 처리 및 배부 연산을 위해 Server Data를 복사할 수 있는 내부함수
    copyServerSignUpData(serverSignUpData){
        let newServerSignUpData = [];

        for(let index=0; index<serverSignUpData.length; index++){
            newServerSignUpData[index] = serverSignUpData[index].slice();
        }

        return newServerSignUpData;
    }
    // Server Data를 Storage에 저장
    saveSignUpDataToStorage(){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let storageDataForSaving = [];
        
        storageDataForSaving = this.ConvertServerSignUpDataToStorage(this.m_eSignUpData);
        window.localStorage.setItem(STOREAGE_ID.SIGNUP_DATA, storageDataForSaving);
        return result;
    }
    // Storage에 있는 데이터를 Server Data에 Upload
    UpdateSignUpDataFromStorage(){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let storageDataForGetting = [];

        storageDataForGetting = window.localStorage.getItem(STOREAGE_ID.SIGNUP_DATA);
        this.m_eSignUpData = this.ConvertStorageToServerSignUpData(storageDataForGetting);
    }
    // Sign Up User 목록 읽기
    GetSignUpUserList(){
        let signUpUserList = [];

        for(let index=0; index<this.m_eSignUpData.length; index++){
            signUpUserList.push(this.m_eSignUpData[index][STORAGE_DATA_INDEX.ID]);
        }
        
        return signUpUserList;
    }

    // 2. Log In Data처리부
    // Server Data를 Storage에 저장
    saveLogInDataToStorage(){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let storageDataForSaving = [];
        
        storageDataForSaving = this.VarifyLogInDataForStorage(this.m_eLogInData);
        window.localStorage.setItem(STOREAGE_ID.LOGIN_DATA, storageDataForSaving);
        return result;
    }
    // Storage에 있는 데이터를 Server Data에 Upload
    UpdateLogInDataFromStorage(){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let storageDataForGetting = [];

        storageDataForGetting = window.localStorage.getItem(STOREAGE_ID.LOGIN_DATA);
        this.m_eLogInData = storageDataForGetting.split(",");
    }
    VarifyLogInDataForStorage(Data){
        let newData = [];

        for(let index=0; index<Data.length; index++){
            if(Data[index] === "") continue;
            newData.push(Data[index]);
        }

        return newData;
    }
    
    // 3. Miniter Data처리부
    // Minitoer Data처리부 코드 추가
    // localStorage에 저장할 수 있는 데이터 형태로 가공 (1차배열 형식만 가능 (객체는 저장되지 않음))
    ConvertServerMiniterDataToStorage(serverMiniterData){
        let storageData = [];
        let indexSelector = 0;
        
        for(let index=0; index<serverMiniterData.length; index++){
            storageData[indexSelector++] = serverMiniterData[index][MINITER_DATA_INDEX.USER_ID]; // 사용자 ID
            // USER별 MINITER내용 ENCODING
            for(let miniterDataIndex=0; miniterDataIndex<serverMiniterData[index][MINITER_DATA_INDEX.CONTENTS].length; miniterDataIndex++){
                storageData[indexSelector++] = serverMiniterData[index][MINITER_DATA_INDEX.CONTENTS][miniterDataIndex][CONTENTS_INDEX.CONTENT]; // CONTENS
                storageData[indexSelector++] = serverMiniterData[index][MINITER_DATA_INDEX.CONTENTS][miniterDataIndex][CONTENTS_INDEX.DATE];     // DATE
                storageData[indexSelector++] = serverMiniterData[index][MINITER_DATA_INDEX.CONTENTS][miniterDataIndex][CONTENTS_INDEX.USER];     // USER
            }
            storageData[indexSelector++] = MINITER_DATA_ENCODE_MASK;
        }

        // 마지막 MINITER_DATA_ENCODE_MASK 삭제
        storageData.pop();

        return storageData;
    }
    // localStorage에서 읽어온 데이터를 Server에서 처리하게 데이터 가공 (2차원 배열 (데이터 복사를 위해 객체형태 배제))
    ConvertStorageToServerMiniterData(storageData){
        let storageDataArrayByID = [];
        let serverMiniterData = [];

        // DECODING 작업
        storageDataArrayByID = storageData.split(MINITER_DATA_ENCODE_MASK);
        // 1차 데이터 가공
        for(let index=0; index<storageDataArrayByID.length; index++){
            if(storageDataArrayByID[index][0] === ','){
                storageDataArrayByID[index] = storageDataArrayByID[index].substring(1, storageDataArrayByID[index].lengh);
            }
        }

        for(let index=0; index<storageDataArrayByID.length; index++){
            let storageDataArray = storageDataArrayByID[index].split(",");
            let newUserData = [storageDataArray[0], []];
            serverMiniterData.push(newUserData);

            for(let miniterDataIndex=1; 
                miniterDataIndex<(storageDataArray.length-CONTENTS_INDEX.MAX_INDEX); 
                miniterDataIndex = miniterDataIndex + CONTENTS_INDEX.MAX_INDEX){
                let newContents = [];
                newContents[CONTENTS_INDEX.CONTENT] = storageDataArray[miniterDataIndex + CONTENTS_INDEX.CONTENT];
                newContents[CONTENTS_INDEX.DATE] = storageDataArray[miniterDataIndex + CONTENTS_INDEX.DATE];
                newContents[CONTENTS_INDEX.USER] = storageDataArray[miniterDataIndex + CONTENTS_INDEX.USER];
                serverMiniterData[index][MINITER_DATA_INDEX.CONTENTS].push(newContents);
            }
        }

        return serverMiniterData;
    }
    // Server Data를 Storage에 저장
    saveMiniterDataToStorage(){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let storageDataForSaving = [];
        
        storageDataForSaving = this.ConvertServerMiniterDataToStorage(this.m_eMiniterData);
        window.localStorage.setItem(STOREAGE_ID.MINITER_DATA, storageDataForSaving);
        return result;
    }
    // Storage에 있는 데이터를 Server Data에 Upload
    UpdateMiniterDataFromStorage(){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let storageDataForGetting = [];

        storageDataForGetting = window.localStorage.getItem(STOREAGE_ID.MINITER_DATA);
        this.m_eMiniterData = this.ConvertStorageToServerMiniterData(storageDataForGetting);
    }
    // Storage에 신규 Tweet Data 등록
    InsertMiniterDataToStorage(UserID, insertedMiniterData){
        let returnValue = 0; // 0:작업완료, 1이상:에러코드 전송
        let newMiniterData = [];
        let foundMiniterIndex = -1;

        // Server Control Data Memory 수정 (DBMS가 없으므로 수정시마다 데이터 동기화 해야 함)
        foundMiniterIndex = this.searchMinterDataIndex(UserID);
        newMiniterData = this.m_eMiniterData[foundMiniterIndex][MINITER_DATA_INDEX.CONTENTS];
        newMiniterData.push(insertedMiniterData);
        this.m_eMiniterData[foundMiniterIndex][MINITER_DATA_INDEX.CONTENTS] = newMiniterData;

        // 물리적 저장공간(localStorage Data Update)
        this.saveMiniterDataToStorage();

        return returnValue;
    }
    // Storage에 있는 데이터 Search하기
    SearchMiniterDataFromStorage(UserID){
        let miniterData = [];
        let foundMiniterIndex = -1;

        foundMiniterIndex = this.searchMinterDataIndex(UserID);
        miniterData = this.m_eMiniterData[foundMiniterIndex][MINITER_DATA_INDEX.CONTENTS].slice();

        return miniterData;
    }
    // Storage에 있는 데이터 수정하기
    ModifyMiniterDataToStorage(UserID, miniterDataID){
        // 여러 Client와의 데이터 동기문제를 고려하여 수정필요 (추후예정)
        // Server에서 Miniter 데이터 전송시 개별 Data에 고유 Key값을 보내는 방식으로 처리 가능
        // 해당 Tweets의 고유식별 방법이 있어야 함 (단순히 시간이나 Tweeter의 ID만 가지고는 불분명)
    }
    DeleteMiniterDataToStorage(UserID, miniterDataID){
        // 여러 Client와의 데이터 동기문제를 고려하여 수정필요 (추후예정)
        // Server에서 Miniter 데이터 전송시 개별 Data에 고유 Key값을 보내는 방식으로 처리 가능
        // 해당 Tweets의 고유식별 방법이 있어야 함 (단순히 시간이나 Tweeter의 ID만 가지고는 불분명)
    }

    // 내부변수
    searchMinterDataIndex(UserID){
        let miniterDataIndex = -1; // 찾지 못한 경우 상위에서 에러처리 필요 (추후진행예정)

        for(let index=0; index<this.m_eMiniterData.length; index++){
            if(UserID === this.m_eMiniterData[index][MINITER_DATA_INDEX.USER_ID]){
                miniterDataIndex = index;
                break;
            }
        }

        return miniterDataIndex;
    }
};


/***************************************************************
 * DATA CONTROL CLASS 선언부
***************************************************************/
class ServerDataCtrl extends ServerData {
    // 0. 생성자
    constructor(cClientInterface){
        // Parentes 생성자 호출
        super();
        this.m_ClientInterface = cClientInterface;

        // Server Data Controller 생성
        this.createDataCtrl();
    }

    createDataCtrl(){
        // INSTANCE 생성시 초기화 로직
        // 코드 추가부분
    }

    // 1. Sign Up Data처리부
    // ID존재여부 확인
    IsThereSignUpID(IDForChecking, serverDataIndex=null){
        let isThereID = false;

        for(let index=0; index<this.m_eSignUpData.length; index++){
            if(IDForChecking === this.m_eSignUpData[index][STORAGE_DATA_INDEX.ID]){
                // 인자로 넘어온 경우에만 대입
                if(serverDataIndex !== null){
                    serverDataIndex[0] = index;
                }
                isThereID = true;
                break;
            }
        }

        return isThereID;
    }
    // 신규 ID등록
    InsertSignUpData(newID, newName, newPW, newProfile){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let newMiniter = [];

        // 예외처리
        // 0. 이미 해당 ID가 존재하는 경우
        if(this.IsThereSignUpID(newID) === true){
            return 1; // ERROR_CODE_1 : 이미 해당 ID가 존재함
        }

        // DATA가공 (안전한 데이터 가공)
        let newServerSignUpData = this.copyServerSignUpData(this.m_eSignUpData);
        newMiniter.push(newID, newName, newPW, newProfile);
        newServerSignUpData.push(newMiniter)
        this.m_eSignUpData = newServerSignUpData;
        
        // Storage에 적용
        this.saveSignUpDataToStorage();
    }
    // 해당 ID 정보 수정
    ModifySignUpData(ID, modifiedName, modifiedPW, modifiedProfile){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let ModifiedMiniter = [];
   
        // 예외처리
        // 0. 해당 ID가 존재하지 않는 경우
        if(this.IsThereSignUpID(ID) === false){
            return 1; // ERROR_CODE_1 : 해당 ID가 존재하지 않음
        }

        // DATA가공 (안전한 데이터 가공)
        let newServerSignUpData = this.copyServerSignUpData(this.m_eSignUpData);
        for(let index=0; index<newServerSignUpData.length; index++){
            if(ID === newServerSignUpData[index][STORAGE_DATA_INDEX.ID]){
                // 데이터 수정작업
                newServerSignUpData[index][STORAGE_DATA_INDEX.ID] = ID;
                newServerSignUpData[index][STORAGE_DATA_INDEX.NAME] = modifiedName;
                newServerSignUpData[index][STORAGE_DATA_INDEX.PW] = modifiedPW;
                newServerSignUpData[index][STORAGE_DATA_INDEX.PROFILE] = modifiedProfile;
                break;
            }
        }

        this.m_eSignUpData = newServerSignUpData;
        
        // Storage에 적용
        this.saveSignUpDataToStorage();
    }
    // 해당 ID 정보 삭제
    DeleteSignUpData(ID){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let searchedDataIndex = [];
   
        // 예외처리
        // 0. 해당 ID가 존재하지 않는 경우
        if(this.IsThereSignUpID(ID, searchedDataIndex) === false){
            return 1; // ERROR_CODE_1 : 해당 ID가 존재하지 않음
        }

        // DATA가공 (안전한 데이터 가공)
        let newServerSignUpData = this.copyServerSignUpData(this.m_eSignUpData);
        newServerSignUpData.splice(searchedDataIndex[0], 1);
        this.m_eSignUpData = newServerSignUpData;
        
        // Storage에 적용
        this.saveSignUpDataToStorage();
    }
    // 해당 ID 정보 검색
    SearchSignUpData(ID){
        let searchedSignUpData = [];

        for(let index=0; index<this.m_eSignUpData.length; index++){
            if(this.m_eSignUpData[index][STORAGE_DATA_INDEX.ID] === ID){
                searchedSignUpData = this.m_eSignUpData[index].slice();
                break;
            }
        }

        return searchedSignUpData;
    }

    // 2. LogIn Data처리부
    // ID존재여부 확인
    IsThereLogInID(IDForChecking, serverDataIndex=null){
        let isThereID = false;

        for(let index=0; index<this.m_eLogInData.length; index++){
            // 예외사항 처리
            if(this.m_eLogInData[index].length === 0) continue;

            if(IDForChecking === this.m_eLogInData[index]){
                // 인자로 자료구조가 넘어온 경우에만 대입
                if(serverDataIndex !== null){
                    serverDataIndex[0] = index;
                }
                isThereID = true;
                break;
            }
        }

        return isThereID;
    }
    // PASSWORD 일치상태 확인
    CheckPassword(ID, PW){
        let isOK = 0; // 0:불일치, 1:일치, 2:비회원
        let userSignUpData = [];

        // 예외처리
        // 0. 해당 ID가 존재하지 않는 경우
        if(this.IsThereSignUpID(ID) === false){
            return 2; // 비회원
        }

        userSignUpData = this.SearchSignUpData(ID);
        isOK = (userSignUpData[STORAGE_DATA_INDEX.PW] === PW)? 1 : 0;
    
        return isOK;
    }
    // 신규 ID등록
    LogIn(IDForLogIn){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
 
        // 예외처리
        // 0. 이미 해당 ID가 존재하는 경우
        if(this.IsThereLogInID(IDForLogIn) === true){
            return 1; // ERROR_CODE_1 : 이미 해당 ID가 존재함
        }

        // DATA가공 (안전한 데이터 가공)
        let newServerLogInData = this.m_eLogInData.slice();
        newServerLogInData.push(IDForLogIn);
        this.m_eLogInData = newServerLogInData;
        
        // Storage에 적용
        this.saveLogInDataToStorage();
    }
    // 해당 ID 정보 삭제
    LogOut(IDForLogOut){
        let result = 0; // 0:정상, 1이상:에러코드 (추후 예외처리용)
        let searchedDataIndex = [];
    
        // 예외처리
        // 0. 해당 ID가 존재하지 않는 경우
        if(this.IsThereLogInID(IDForLogOut, searchedDataIndex) === false){
            return 1; // ERROR_CODE_1 : 해당 ID가 존재하지 않음
        }

        // DATA가공 (안전한 데이터 가공)
        let newServerLogInData = this.m_eLogInData.slice();
        newServerLogInData.splice(searchedDataIndex[0], 1);
        this.m_eLogInData = newServerLogInData;
        
        // Storage에 적용
        this.saveLogInDataToStorage();
    }
    
    // 3. Miniter Data처리부
    // Minitoer Data처리부 코드 추가

};

// LoginBody Class 정의부
const GlobalServerDataCtrl = new ServerDataCtrl();