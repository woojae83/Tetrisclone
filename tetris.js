import BLOCKS from "./blocks.js";


// DOM 선언 하는 부위
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
// Setting 선언하는 부위
const GAME_ROWS = 20;
const GAME_COLS = 10;


//자주 사용하는 변수들 선언 variables
let score = 0; //점수 
let duration = 500; //블록이 떨어지는 시간
let downInterval; //null 값으로 
let tempMovingItem;//무빙을 실제적으로 실행하기 전에 잠깐 담아두는 용도로 사용하는 변수


const movingItem = {  //다음 블록의 타입과 좌표와같은 정보들을 가지고 있는 변수
     type:"", //BLOCKS 타입(블록 모양)
     direction: 3, // 화살표를 빙빙돌리는데 도와주는 지표 (모양 바뀌는 거)    
     top: 0, //좌표 기준으로 어디까지 내려와 있는지 어디까지 내려가야 되는지 표현(밑으로 가는거)
     left: 0 //좌우값을 알려주는 용도 (좌우로 가는거)
};


//처음 렌더링이 되면 init 호출 하면서 init 실행

init()

//처음으로 게임을 실행하기 위해서 functions
function init(){
    
    tempMovingItem = { ...movingItem}; //init을 하게되면 잠깐 movingItem 값만 담아둠/movingItem과 tempMovingItem 값을 분리하기 위해 movingItem자체가 아닌 값만 담아둠
    
    for (let i = 0; i < 20; i++){
       prependNewLine(); //라인 생성
    }
    generateNewBlock() //블록 생성
 };

 function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j = 0; j < 10; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul)  
    playground.prepend(li)  
 }

 //BLOCKS 값에 맞는 모양대로 그림(색깔)을 그려주는 역할 
 function renderBlocks(moveType=""){  //moveBlock에서만 인자를 보냄, 다른데서 보내지 않을 경우는 빈칸으로 초기화 값을 넣어줌
    const { type, direction, top,left } = tempMovingItem; //tempMovingItem의 프러퍼티들을 하나하나씩 바로 변수로 사용할 수 있도록함
    const movingBlocks = document.querySelectorAll(".moving") //moving 클래스를 갖는 모든 엘레멘트를 불러옴,moving 클래스만 색깔을 가질 수 있도록 해줌
    movingBlocks.forEach(moving=>{
        moving.classList.remove(type, "moving");//tree 와 moving 클래스 를 빼줌으로 더이상 색상이 늘어나는 현상을 방지
        
    })
    BLOCKS[type][direction].some(block => {//BLOCKS안의 type에 접근,direction(네가지모양)에 접근//forEach대신 some을 씀(반복문은 중간에 정지를 시키고 싶을때 정지를 시킬 수 없음)
        const x = block[0] + left; /**x는 반복문 block문 0번값, x는 ul안에 들어있는 li(li.prepend(ul) )의 값이 됨.
                                    옆으로 이동하는 위치 값 변화*/
        const y = block[1] + top; /**y는 반복문 block문 두번째 값,y는 li의 row값(playground.prepend(li))이 됨. 
                                  아래로 이동하는 위치 값 변화*/
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;/**타켓이 되는 matrix는 어떻게 찾냐면?playground안에 들어있는childNodes[y].childNodes[0].childNodes[x] 찾아들어감
                                                                                                             *3항 연산자를 씀 : 블럭 밖으로 더 이상 나갈 수 없도록 해줌*/
        const isAvailabe = checkEmpty(target); 
        if(isAvailabe){    //checkEmpty(target) 참이면,빈공간이 있으면 좌표를 원 상태로 돌려놓고,
            target.classList.add(type, "moving")//type을 클래스로 줌, "moving"을 클래스로 줌   
        }else {                 /**BLOCKS[type][direction].forEach(block..이 잘못된 부분으로 이동하는거라 하면, 다시 tempMovingItem을 바꾸기 전에 
                                movingItem을 다시 tempMovingItem에 다시 집어넣고, 다시 한번더  renderBlocks()를 호출해서 다시 모양이 나올수 있도록 해주는 원리*/
            tempMovingItem = { ...movingItem}
            
            if(moveType === 'retry'){  //moveType에 'retry'가 들어오면 게임오버 문구 보여줌
                clearInterval(downInterval); //인터벌을 멈추고 
                showGameoverText(); // 게임텍스트를 보여줌
            }
            setTimeout(() =>{ //재귀함수 renderBlocks에러(Maximum call stack size) 발생을 방지하기 위해서  setTimeout사용,stack이 넘치는걸 방지
                renderBlocks('retry'); /**블록들이 쌓이고 맨위줄 li에 꽉 찼을때 게임을 끝나는 경우임,
                                        isAvailabe이 빈 값인 경우에 seizeBlock()을 하고 renderBlocks() 을 하게 되는데,  
                                        renderBlocks에 retry 값으로 넘겼는데 또다시 renderBlocks이 불리면 그 경우는 맨위 li 더 위는 -1가되고 빈공간을 두번 타게 됨,결국에는 마지막일 수 밖에없어 게임 오버되게함 */     
                                          
                if(moveType === "top"){
                    seizeBlock(); 
                }  // 맨아래에서 더 아래로 나가는걸 방지
            },0)   
            return true; //첫번째 블럭이 돌다가 빈값이 나오면 return true가 나와서 나머지 블럭은 돌지 않고 새롭게 renderBlocks() 시작할 수 있도록 만듦.
        }              
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction; /**tempMovingItem값을 원래대로 바꿔줌,블록을 옮긴 후에 BLOCKS[type][direction].
    * forEach(block 문이 정상적으로 작동되는지 한바퀴를 돌고나서 정상적으로 작동되면 그제서야 movingItem을 업데이트 시켜주는 코드*/
 } 


/** 블록이 마지막에 도달해서 더 내려가지 않게하고,색깔은 그대로 놔두고 moving이라는 클래스를 다 뗀 후에
 * 새로운 블록을 만듦 */
function seizeBlock(){ 
    const movingBlocks = document.querySelectorAll(".moving")
    movingBlocks.forEach(moving=>{
        moving.classList.remove("moving");
        moving.classList.add("seized"); //새로운 블록 생성         
    })

    checkMatch();
    generateNewBlock(); 
       
 };

 //매칭 되는 코드가 있는지 체크
 function checkMatch(){

    const childNodes = playground.childNodes; // playground 전체의 childNodes 먼저 가져옴
    childNodes.forEach(child=>{      //childNodes 각각의 li를 체크 
        let matched = true; //matched를 트루로 주고
        child.children[0].childNodes.forEach(li=>{//children은 첫번째 ul,children[0]는 ul의 모든 li,forEach반복하면 하나의 li가 됨
            if(!li.classList.contains("seized")){ //만약 li에 "seized"가 하나라도 없다고 하면 완성이 안된걸로 함
                matched = false; //매치가 안된다고 matched를  false로 값을 변경하고
            }      
        })       
        if(matched){//위 반복문들이 끝나고 만약에 matched가  된게 있으면
            child.remove(); //각각 li들을 제거 하고
            prependNewLine(); //각각의 li한 줄이 없어질때마다 맨 윗줄에 다시 li가 생성 
            score++;
            scoreDisplay.innerText = score;
       
        }  
   
    })
   
    //generateNewBlock(); 

 }


//** 새로운 블록을 만드는 함수 */
function generateNewBlock(){

    clearInterval(downInterval);//진행되고 있는 인터벌(자동으로 블록이 내려오는 시간 간격)이 있을 수 있어서 만듦
    downInterval = setInterval(() => {
        moveBlock('top', 1)//moveBlock에 블록을 내리는키 1초씩 증가
        
    }, duration) // 블록이 내려오는 시간 간격
    const blockArray = Object.entries(BLOCKS);//BLOCKS는 오브젝트 이기 때문에  Object.entries로 감싸줌
    const randomIndex = Math.floor(Math.random()* blockArray.length)//인덱스로 사용할 수 있는 랜덤한 숫자가나옴(블록 랜덤 생성)
    movingItem.type = blockArray[randomIndex][0];//randomIndex의 첫번째 블록 이름을 불러옴
    movingItem.top = 0;  //무빙아이템 초기화
    movingItem.left = 3;  // 가운데 정렬
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem}; //movingItem값만 다시 담아둠
    renderBlocks(); //renderBlocks 다시 실행해서 새로운 블록 생성
};
    

/**target을 한번더 체크 해주는 함수,빈여백을 체크해서 블록이 밖으로 안나가게 해주고,블록이 맨 하단으로 떨어졌을때
  * 또 다른 블록이 생성되고 그블록이 먼저 떨어져 있는 블록 위에 떨어졌을때,그 밑에 블록이 있는지 없는지를 체크 하는 함수
 */
 function checkEmpty(target){
    if(!target || target.classList.contains("seized")){//"target"이 없거나, "seized"라는 클래스가 있으면, 둘 중 true면  false 반환
        return false;
    }
    return true;

 }
 //moveBlock 함수,블록이 이동하게 만드는 함수
 function moveBlock(moveType, amount){  //moveType: moveBlock의 left값,top을 인자로 받음
    tempMovingItem[moveType] += amount; //tempMovingItem의 left 값을 바꿔줌
    renderBlocks(moveType) //블록이 이동 후 renderBlocks을 다시 실행
    
 }

//moveBlock 함수,블록이 이동하게 만드는 함수
function changDirection(){  //moveType: moveBlock의 "direction"값을 인자로 받음
    const direction = tempMovingItem.direction; //tempMovingItem의 direction 값을 바꿔줌
    direction === 3? tempMovingItem.direction = 0 : tempMovingItem.direction +=1;
    renderBlocks()//블록이 돌다가 0으로 초기화 되면 renderBlocks을 다시 실행
                  /**tempMovingItem.direction += 1; 
                  if(tempMovingItem.direction === 4){
                  tempMovingItem.direction = 0;*/ //위의 3항 연산자로 간결하게 바꿈
};

//스페이스바를 눌렀을때 블록이 한번에 내려올 수 있게 해줌
function dropBlock(){
    clearInterval(downInterval) //잠깐 블록이 내려오는 걸  중단
    downInterval = setInterval(() => {
        moveBlock('top', 1)//moveBlock에 블록을 내리는키 1초씩 증가    
    }, 10)
};


// 게임 텍스트 함수, 게임이 종료가 되면 종료 텍스트 보여줌
function showGameoverText(){
    
    gameText.style.display = "flex";

};


 // event handling, 방향키를 읽어서 위치를 변화시킴
 document.addEventListener("keydown", e => {//키를 눌렀을때 작동하는 이벤트,메서드는 지정한 유형의 이벤트를 대상이 수신할 때마다 호출할 함수를 설정합니다.
    switch(e.keyCode){
        case 39: //keyCode(right) 를 사용해서 우로 이동
            moveBlock("left", 1);  
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changDirection("di", 1);
            break;
        case 32:
            dropBlock();//스페이스바가 눌리면 바로 블록이 떨어짐
            break;
        default:
            break    


    }  
    
    //console.log(e)  

 })

 //다시 시작 버튼 
 restartButton.addEventListener("click",() =>{
    playground.innerHTML = "";
    gameText.style.display = "none";
    init()
 })