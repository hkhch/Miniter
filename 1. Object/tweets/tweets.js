/***************************************************************
 * 파일명 : tweets.js
 * 작성일 : 2019. 08. 04
 * 작성자 : 한광훈
 * 내  용 : Tweets Body Class
 * 비  고 : Area별 객체화하여 작성할 수 있으나 Tweets Page을 기준으로
 *         Class화 (구역별 객체화 예제는 login.js / signup.js 참조)
 ***************************************************************/

/***************************************************************
 * 사용자 정의 자료구조 (Abstract Data Type)
***************************************************************/
const ERROR_MESSAGE = {
    ID_PW_WRONG: "입력하신 데이터가 올바르지 않습니다. 확인부탁드립니다.",
};

const ALARM_MESSAGE = {
    THERE_IS_NOT: "존재하지 않는 ID입니다."
};

const CHILD_ELEMENT_CLASS = {
    USER_AREA: "USER_AREA",
    MINITOR: "MINITOR",
    EXCEPTION_VIEW: "EXCEPTION_VIEW",
    LOGIN_USER: "LOGIN_USER",
    TWEETS_CNT: "TWEETS_CNT",
    SIGNUP_USER_LIST: "SIGNUP_USER_LIST",
    TWEETS_INPUT: "TWEETS_INPUT",
    TWEETS_BUTTON: "TWEETS_BUTTON",
    VIEW_BUTTON: "VIEW_BUTTON",
    RETURN_BUTTON: "RETURN_BUTTON",
    CONTENTS_AREA: "CONTENTS_AREA"
};

const CONTENT_TAG_CLASS = {
    CONTENTS_AREA: "CONTENTS_AREA",
    CONTENTS: "CONTENTS",
    CONTENT:"CONTENT",
    USERNAME: "USERNAME",
    TWEETDATE: "TWEETDATE",
    MESSAGE: "MESSAGE",
    LINE_ONE: "LINE_ONE",
    EXCEPTION_VIEW: "EXCEPTION_VIEW",
    EXCEPTION_BUTTON: "EXCEPTION_BUTTON"
}



/***************************************************************
 * TWEETS CLASS
***************************************************************/
// Tweets Class 선언부
class Tweets extends Common {
    // 0. 생성자
    constructor(cServerInterface){
        // Parentes 생성자 호출
        super();
        this.meUserArea = null;
        this.m_eMinitor = null;
        this.m_eExceptionView = null;
        this.m_eLoginUser = null;
        this.m_eTweetsCnt = null;
        this.m_eSignUpUserList = null;
        this.m_eTweetsInput = null;
        this.m_eTweetsButton = null;
        this.m_eViewButton = null;
        this.m_eReturnButton = null;
        this.m_eContentsArea = null;
        this.m_cServerInterface = cServerInterface;

        this.m_currentUser = "";
        this.m_sortMode = 0;

        // InputElement생성
        this.createData();
    }

    createData(){
        // HTML ELEMENT REFERENCE 변수
        this.meUserArea = document.getElementsByClassName(CHILD_ELEMENT_CLASS.USER_AREA).item(0);
        this.m_eMinitor = document.getElementsByClassName(CHILD_ELEMENT_CLASS.MINITOR).item(0);
        this.m_eExceptionView = document.getElementsByClassName(CHILD_ELEMENT_CLASS.EXCEPTION_VIEW).item(0);
        this.m_eLoginUser = document.getElementsByClassName(CHILD_ELEMENT_CLASS.LOGIN_USER).item(0);
        this.m_eTweetsCnt = document.getElementsByClassName(CHILD_ELEMENT_CLASS.TWEETS_CNT).item(0);
        this.m_eSignUpUserList = document.getElementsByClassName(CHILD_ELEMENT_CLASS.SIGNUP_USER_LIST).item(0);
        this.m_eTweetsInput = document.getElementsByClassName(CHILD_ELEMENT_CLASS.TWEETS_INPUT).item(0);
        this.m_eTweetsButton = document.getElementsByClassName(CHILD_ELEMENT_CLASS.TWEETS_BUTTON).item(0);
        this.m_eViewButton = document.getElementsByClassName(CHILD_ELEMENT_CLASS.VIEW_BUTTON).item(0);
        this.m_eReturnButton = document.getElementsByClassName(CHILD_ELEMENT_CLASS.RETURN_BUTTON).item(0);
        this.m_eContentsArea = document.getElementsByClassName(CHILD_ELEMENT_CLASS.CONTENTS_AREA).item(0);

        // EVENT HANDLER BINDING
        this.m_eExceptionView.onclick = this.onClickReturnButton.bind(this);
        this.m_eTweetsButton.onclick = this.onClickTweetsButtton.bind(this);
        this.m_eViewButton.onclick = this.onClickViewButton.bind(this);
        this.m_eReturnButton.onclick = this.onClickReturnButton.bind(this);

        // MEMBER VALUE 초기화
        this.m_currentUser = this.whoisLoginUser();

        // 현재 LOGIN USER가 있는 경우에만 VIEW화면으로 전환
        if(this.m_currentUser !== ""){
            this.m_eMinitor.style.display = "block";
            this.m_eLoginUser.innerHTML = this.m_currentUser;

            // SIGN UP USER LIST 초기화
            let signUpUserList = this.getSignUpUserList();
            this.initSignUpUserList(signUpUserList);

            // Miniter Data 표시
            this.displayMiniterData();
        }
        else{
            // RETURN 유도화면 표시
            this.displayExceptionView();
        }
    }

    // 0. MEMBER FUNCTION 선언 and 정의
    // 현재 로그인 USER 읽어오기 (sessionStorage에서 확인)
    whoisLoginUser(){
        let returnValue = "";
        let result = "";

        // SESSIONSTORAGE에서 LOGIN USER확인
        result = window.sessionStorage.getItem(SESSION_STORAGE.CURRENT_LOGIN_USER);
        if((result !== null) && (result !== "")){
            returnValue = result;
        }

        return returnValue;
    }
    // SERVER로부터 현재 등록된 USER LIST 얻기
    getSignUpUserList(){
        let signUpUserList = [];
        signUpUserList = this.m_cServerInterface.GetSignUpUserList();
        return signUpUserList;
    }
    // SIGN UP USER LIST 초기화
    initSignUpUserList(signUpUserList){
        for(let index=0; index<signUpUserList.length; index++){
            let elOptNew = document.createElement('option');
            elOptNew.text = signUpUserList[index];
            this.m_eSignUpUserList.add(elOptNew);
        }

        this.m_eSignUpUserList.selectedIndex = 0;
    }
    // MINITER DATA 내용 DISPLAY
    displayMiniterData(){
        let miniterData = this.m_cServerInterface.SearchMiniterDataFromStorage(this.m_currentUser);

        for(let index=0; index<miniterData.length; index++){
            let content = miniterData[index].slice();
            this.addMiniterElement(content);
        }

        // Tweets 수 Refresh
        this.m_eTweetsCnt.innerHTML = miniterData.length;
        // Normal Mode : 전체표시, Sort Mode : Sorting 정보표시
        this.m_sortMode = 0;
    }
    // MINITER ELEMENT 생성 and 추가
    addMiniterElement(MiniterData){
        let returnValue = 0; // 0: 정상처리, 1:에러

        // 예외처리
        if(Array.isArray(MiniterData) === false) return 1;
    
        // ELEMENT 생성작업
        // ul ELEMENT 존재 유무확인 후 필요시 생성
        let elContentsArea = document.getElementsByClassName(CONTENT_TAG_CLASS.CONTENTS_AREA).item(0);
        let elMinitContentsWrap = document.querySelector(".CONTENTS_AREA ul");
        if(elMinitContentsWrap === null){
            elMinitContentsWrap = document.createElement("ul");
            elMinitContentsWrap.className = CONTENT_TAG_CLASS.CONTENTS;
            elContentsArea.appendChild(elMinitContentsWrap);
        }

        // 1. CONTENT LAYER
        let elContent = document.createElement("li");
        elContent.className = CONTENT_TAG_CLASS.CONTENT;
        // 1.1 TITLE LAYER
        let elTitleLayer = document.createElement("div");
        // 1.1.1 USER NAME 출력
        let elUserName = document.createElement("div");
        elUserName.className = CONTENT_TAG_CLASS.USERNAME;
        elUserName.innerHTML = MiniterData[CONTENTS_INDEX.USER];
        elUserName.onmouseenter = this.onMouseEnterOnUserName.bind(this);
        elUserName.onmouseleave = this.onMouseLeaveOnUserName.bind(this);
        elUserName.onclick = this.onClickOnTweetUserID.bind(this);
        elTitleLayer.appendChild(elUserName);
        // 1.1.2 TWEET DATE 출력
        let elTweetDate = document.createElement("div");
        elTweetDate.className = CONTENT_TAG_CLASS.TWEETDATE;
        elTweetDate.innerHTML = MiniterData[CONTENTS_INDEX.DATE];
        elTitleLayer.appendChild(elTweetDate);
        elContent.appendChild(elTitleLayer);
        // 1.2 Message Layer
        let elMessageLayer = document.createElement("div");
        // 1.2.1 message 출력
        let elMessage = document.createElement("div");
        elMessage.className = CONTENT_TAG_CLASS.MESSAGE;
        elMessage.innerHTML = MiniterData[CONTENTS_INDEX.CONTENT];
        elMessageLayer.appendChild(elMessage);
        elContent.appendChild(elMessageLayer);
        // 1.3 Line 출력
        let elLine = document.createElement("hr");
        elLine.className = CONTENT_TAG_CLASS.LINE_ONE;
        elContent.appendChild(elLine);
     
        // CONTENTS에 추가
        elMinitContentsWrap.insertBefore(elContent, elMinitContentsWrap.childNodes[0]);
    
        // Display Tweet Data 관리
        // DisplayTweetData.push(TweetData);
    
        return returnValue;
    }
    // 예외 창 표시
    // MINITER ELEMENT 생성 and 추가
    displayExceptionView(){
        let returnValue = 0; // 0: 정상처리, 1:에러
        
        this.m_eExceptionView.style.display = "block";
        return returnValue;
    }

    displaySortContents(selectedUserID){
        let elMinitContentsWrap = document.querySelector(".CONTENTS_AREA ul");
        let sortContentsCnt = 0;

        // LIST ELEMENT 삭제
        while(elMinitContentsWrap.firstChild) {
            elMinitContentsWrap.removeChild(elMinitContentsWrap.firstChild);
        }
        // SORT ELEMENT 표시
        let miniterData = this.m_cServerInterface.SearchMiniterDataFromStorage(this.m_currentUser);
        for(let index=0; index<miniterData.length; index++){
            let content = miniterData[index].slice();
            if(selectedUserID !== content[CONTENTS_INDEX.USER]) continue;
            // SORT CONTENTS 표시
            this.addMiniterElement(content);
            sortContentsCnt++;
        }

        // Tweets 수 Refresh
        this.m_eTweetsCnt.innerHTML = sortContentsCnt;
    }

    insertNewContent(content, date, userID){
        let returnValue = 0; // 0:정상, 1이상:비정상
        let newContent = [content, date, userID];

        // 데이터 무결서 체크
        content.trim();
        date.trim();
        userID.trim();
        // 데이터 무결성에 문제가 있는 경우
        if((content === "") || (date === "") || (userID === "")){
            this.DisplayMsg(ERROR_MESSAGE.ID_PW_WRONG);
            return 1;
        }

        // ELEMENT 추가
        this.addMiniterElement(newContent);

        // Tweets 수 Refresh
        this.m_eTweetsCnt.innerHTML++;

        // SEVER STORAGE에 추가
        this.m_cServerInterface.InsertMiniterDataToStorage(this.m_currentUser, newContent);
    }


    // EVENT HANDLER 정의부
    onClickTweetsButtton(){
        let newContent = this.m_eTweetsInput.value;
        let date = new Date().format();
        let logInUser = this.m_eSignUpUserList.options[this.m_eSignUpUserList.selectedIndex].text;
        this.insertNewContent(newContent, date, logInUser);
    }

    onClickOnTweetUserID(event){
        this.displaySortContents(event.currentTarget.innerHTML);
        this.m_sortMode = 1;
    }

    onClickViewButton(){
        this.displayMiniterData();
    }

    onClickReturnButton(){
        location.href = MAIN_PAGE;
    }
    
    onMouseEnterOnUserName(event){
        if(this.m_sortMode === 0){
            event.currentTarget.style.color = "RED";
        }
    }

    onMouseLeaveOnUserName(event){
        if(this.m_sortMode === 0){
            event.currentTarget.style.color = "rgb(38, 128, 211)";
        }
    }
};

// LoginBody Class 정의부
const GlobalETweets = new Tweets(GlobalServerDataCtrl);
