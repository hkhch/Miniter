/***************************************************************
 * 파일명 : eSmartInput.js (Utility Class)
 * 작성일 : 2019. 08. 02
 * 작성자 : 한광훈
 * 내  용 : 부모 Element를 입력받아 기능별 INPUT Element를 생성
 *          cf. Prefix "E" : element를 의미
 *          독립적인 파일(eSmartInput.js)로 모듈화하여 필요한 
 *          js파일에 import하려고 했는데 export/import 토큰이 
 *          적용되지 않았음 (차선책으로 직접 한 파일에 선언하여 사용)
 ***************************************************************/
'use strict';
class ESmartInput {
    // 생성자 함수
    // 이벤트 CALLBACK 함수는 추후 정리하여 일반화 (현재는 교육용으로 Click이벤트만 처리)
    constructor(eParents, inputType, placeholder, onKeyup){
        // 생성 될 때마다 INSTANCE 개수 증가 (정적변수) : SmartInput객체 CSS ID로 사용하기 위해
        ESmartInput.m_TotalInputInstance++;

        // ESmartInput Class Member 변수
        this.m_eSamrtInputID = ESmartInput.m_TotalInputInstance;
        this.m_eParents = eParents;
        this.m_inputType = inputType;
        this.m_placeholder = placeholder;
        this.m_eTHIS = null;
 
        // InputElement생성
        this.createInputElement(onKeyup);
    }

    // Member 함수 선언 및 정의
    createInputElement(onKeyupHandler){
        let returnValue = 0; // 0: 정상처리, 1 이상:에러번호

        // 예외처리 (상황에 따라 예외처리 항목 추가)
        if(typeof(this.m_eParents) !== "object") return 1;

        // INPUT ELEMENT 생성고정
        // 1. ELEMENT INSTANCE 생성
        let elNewInput = document.createElement("input");
        // 2. ELEMENT ATTRIBUTE 설정
        elNewInput.type = this.m_inputType;
        elNewInput.placeholder = this.m_placeholder;
        elNewInput.id = `${this.m_eSamrtInputID}`;
        // 3. CSS PROPERTY 설정 
        // (기본적인 요구사항 설정 (추후 인스턴트 생성시 필요한 CSS설정 값을 받거나 설정 SELECTOR명을 받아 처리(일반화))
        elNewInput.style.width = "100%";
        elNewInput.style.height = "50px";
        elNewInput.style.border = "none";
        elNewInput.style.borderBottom = "2px solid #346eeb";
        elNewInput.style.placeholder = this.m_placeholder;
        elNewInput.style.marginTop = "3px";
        elNewInput.style.marginBottom = "3px";
        elNewInput.style.fontSize = "1.5em";
        elNewInput.style.fontstyle = "bold";
        elNewInput.style.color = "black";
        elNewInput.style.textAlign = "center";
        // 4. EVENT CALLBACK FUNCTION 바운딩
        if(onKeyupHandler !== null){
            // elNewInput.onkeypress = onKeypressHandler;
            elNewInput.onkeyup = onKeyupHandler;
        }
        // 5. PARENTS ELEMENT에 CHILD ELEMENT 추가
        this.m_eParents.appendChild(elNewInput);
        // 6. Memeber변수에서 사용 할 DOM Reference
        this.m_eTHIS = document.getElementById(`${this.m_eSamrtInputID}`);

        return returnValue;
    }

    // GET INPUT ELEMENT
    getValue(){
        let result = "";
        result = this.m_eTHIS.value;
        return result;
    }

    // CLEAR INPUT ELEMENT VALUE
    ClearValue(){
        this.m_eTHIS.value = "";
    }

    // SET INPUT ELEMENT VALUE
    setValue(setData){
        this.m_eTHIS.value = setData;
    }

    // SET ATTRIBUTE
    // 추후예정
};
// ESmartInput Class Static변수 (생성되는 모든 Instance에서 공통으로 사용되는 메모리)
ESmartInput.m_TotalInputInstance = 0;
