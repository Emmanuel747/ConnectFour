$(document).ready(function() {

   let player = 1;
   let playerNames = [];
   let colors = {};
   colors[-1] = "Gold";
   colors[1] = "Crimson";
   let plyNAMES;
   let count = 0;
   let cpuPlayer = -1;
   let cpuMovesMade = new Array; // Array is converted from 1d to 2d in updateboard

   const DEFAULT_NAMES = () => {
      playerNames[-1] = "Player One's";
      playerNames[1] = "Player Two's";
      return undefined
   }

   function storeNames () {
      localStorage.setItem('playerNames', JSON.stringify(plyNAMES));
   }
   
   (function retrieveNames () {
      plyNAMES = JSON.parse(localStorage.getItem('playerNames')) || DEFAULT_NAMES()
      if (plyNAMES) {
         playerNames[-1] = plyNAMES.one;
         playerNames[1] = plyNAMES.two;
         $('.player').text(`Welcome Back, Players: ${plyNAMES.one} & ${plyNAMES.two}`)
      } else { 
         $('.modal').toggleClass("open") }
   })();

   function updateBoard () {
      const SPACES = document.querySelectorAll('.space')
      
      let board = [];
      let boardState = []
      for (let i = 0; i < SPACES.length; i++){
         board[i] = Number($(SPACES[i]).attr("data-player"))
      }
      while(board.length) boardState.push(board.splice(0,7));      
      return boardState
   }

   function nextCpuMove () {
      let boardState = updateBoard()
      for(let i = boardState.length - 1; i > 1; i--) {
         for(let j = boardState[5].length - 1; j > 1; j--) {
            if (boardState[i][j] === -player && boardState[i - 1][j] === -player && boardState[i - 2][j] === -player && boardState[i - 3][j] === 0) {
               let num = (i * 7) + j
               if ((cpuMovesMade.find(move => move == num )) === undefined) {
                  cpuMovesMade.push(num)
                  return num
               }
            }
            if (boardState[i][j] === -player && boardState[i][j - 1] === -player && boardState[i][j - 2] === -player) {
               let num = (i * 7) + (j - 4 < 0 ? 0 : j - 3)
               if ((cpuMovesMade.find(move => move == num )) === undefined) {
                  cpuMovesMade.push(num)
                  return num
               }
            }
         }
      }
      let p = player
      let topLeft = 0;
      let topRight = topLeft + 3;

         for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 4; j++){
               if($("#" + topLeft).attr("data-player") == p
               && $("#" + (topLeft + 8)).attr("data-player") == p
               && $("#" + (topLeft + 16)).attr("data-player") == p){
                  return topLeft + 24;
               }

               if($("#" + topRight).attr("data-player") == p
               && $("#" + (topRight + 6)).attr("data-player") == p
               && $("#" + (topRight + 12)).attr("data-player") == p) {
                  return topRight + 18;
               }
               topLeft++;
               topRight = topLeft + 3;
            }
            topLeft = i * 7 + 7
            topRight = topLeft + 3;
         }
   }

   $(".setup-form").submit(function (event) {
      event.preventDefault();
   });
   $('.setup').on("click", function () {
      $('.modal').toggleClass("open")
   });

   function startButton (){

      playerNames[-1] = document.getElementById("playerName-1").value;
      playerNames[1] = document.getElementById("playerName-2").value;
      plyNAMES = { one: playerNames[-1], two: playerNames[1] };
      storeNames();
      $('.modal').toggleClass("open")
      $(".player").text(`${playerNames[player * -1]} Turn!`);
      $(".player").css("background-color", `${colors[player * -1]}`);
   
   }
   $('.start-game').on("click", startButton)
   $('.close-game-setup').on("click", function (){

      $('.modal').toggleClass("open")
   })

   $(".space").each(function(){
      $(this).attr("id", count);
      $(this).attr("data-player", 0);
      // $(this).text(count)
      // $(this).css("text-align", "center")
      //        .css("font-size", "x-large")
      count++

      $(this).click(function(){
            let nextSpace = ValidColumnCell($(this).attr("id"));
            if(nextSpace != undefined){
               dropAnimation(nextSpace, player);
               $(nextSpace).attr("data-player", player);
               updateCurrentPlayerInfo(player);
               updateBoard();
               nextTurn();
               player *= -1;
            }
         if(cpuPlayer === 1) {
            let delayTime = Math.floor(Math.random() * 1500) 

            setTimeout(function () {
               const randoNum = Math.floor(Math.random() * 7)  
               let blockMove = nextCpuMove();

               if (blockMove !== undefined) {
                  nextSpace = ValidColumnCell(blockMove)
               } else nextSpace = ValidColumnCell(randoNum);

               if(nextSpace != undefined){
                  dropAnimation(nextSpace, player);
                  $(nextSpace).attr("data-player", player);
                  updateCurrentPlayerInfo(player);
                  nextTurn();
                  if (cpuPlayer === 1) {
                     player *= -1;
                  }
               }
            }, delayTime);
         }
      });
   });
   const nextTurn = () => {
      if(checkWin(player)){
         $(".player").text(`${playerNames[player]} is the Winner!`)
                     .css("background-color", `${colors[player]}`)
                     .addClass('winner')
         $('.space').addClass('finished')
      }
   }
   //Forces next Valid space in the Column 
   function ValidColumnCell (x) {
      let y = Number(x);
      let colIndex = y % 7;
      for(let i = 35; i >= 0;){
         let nextSpace = document.getElementById(colIndex+i)
         if($("#" + (colIndex + i)).attr("data-player") === "0") {
            nextSpace = document.getElementById(colIndex+i)
            return nextSpace
         } else {
            i = i - 7
            continue
         }
      }
   }
   
   function checkWin(p){
      //check rows
      let chain = 0;
      for(let i = 0; i < 42; i += 7) {
         for(let j = 0; j < 7; j++) {
            let cell = $("#" + (i+j));
            if(cell.attr("data-player") == p){
               chain++;
            } else {
               chain = 0;
            }
            if(chain >= 4){
               return true;
            }
         }
         chain = 0;
      }
      //checking Columns
      for(let i = 0; i < 7; i++){
         for(let j = 0; j < 42; j+=7){
            let cell = $("#" + (i + j));
            if(cell.attr("data-player") == p) {
               chain++;
            } else {
               chain = 0;
            }
            if(chain >= 4){
               return true;
            }
         }
         chain = 0;
      }
      //check diagonals
      let topLeft = 0;
      let topRight = topLeft + 3;

      for(let i = 0; i < 3; i++) {
         for(let j = 0; j < 4; j++){
            if($("#" + topLeft).attr("data-player") == p
            && $("#" + (topLeft + 8)).attr("data-player") == p
            && $("#" + (topLeft + 16)).attr("data-player") == p
            && $("#" + (topLeft + 24)).attr("data-player") == p) {
               return true;
            }

            if($("#" + topRight).attr("data-player") == p
            && $("#" + (topRight + 6)).attr("data-player") == p
            && $("#" + (topRight + 12)).attr("data-player") == p
            && $("#" + (topRight + 18)).attr("data-player") == p) {
               return true;
            }
            topLeft++;
            topRight = topLeft + 3;
         }
         topLeft = i * 7 + 7
         topRight = topLeft + 3;
      }
      return false;
   }
   function updateCurrentPlayerInfo (playerNum) {
         $(".player").text(`${playerNames[playerNum * -1]} Turn!`)
         $(".player").css("background-color", `${colors[playerNum * -1]}`)
   }

   function newRound () {
      $('.player').removeClass('winner');
      $('.space').removeClass('finished')
      cpuMovesMade = []
      $(".space").each(function(){
         $(this).attr("data-player", 0);
         $(this).css("background-image", "")
      });
      Math.floor(Math.random() * 2) === 0 ? player = -1 : player = 1;
      updateCurrentPlayerInfo(player)
      const target = document.querySelector('.board')

         shake(target, 9, true);
            let maxNum = 1000;
            $(".player1").each(function () { 
              
               let x = (Math.floor(Math.random() * maxNum) % 2 ) > 0 ? Math.floor(Math.random() * -maxNum) : Math.floor(Math.random() * maxNum);
               let y = (Math.floor(Math.random() * maxNum) % 2 ) > 0 ? Math.floor(Math.random() * -maxNum) : Math.floor(Math.random() * maxNum);
               $(this).animate({left: `-=${x}`, top: `+=${y}`}, 900, 'easeOutBounce', function () {
                  
               });
               $(this).animate({opacity: "0"}, 800, 'linear', function () {
                  $(".player1").remove()
               });
            
            })
            $(".player2").each(function () { 
              
               let x = (Math.floor(Math.random() * maxNum) % 2 ) > 0 ? Math.floor(Math.random() * -maxNum) : Math.floor(Math.random() * maxNum);
               let y = (Math.floor(Math.random() * maxNum) % 2 ) > 0 ? Math.floor(Math.random() * -maxNum) : Math.floor(Math.random() * maxNum);
               $(this).animate({left: `-=${x}`, top: `+=${y}`}, 900, 'easeOutBounce', function () {
                  
               })
               $(this).animate({opacity: "0"}, 800, 'swing', function () {
                  $(".player2").remove()
               });
            });  
            $(".announcement").hide()   
   }
   $(".announcement").hide()
   $('.resetButton').on("click", newRound)

   $(".cpuMode").on("click", function () {
      if ($('.cpuMode').hasClass('active')) {
         playerNames[-1] = plyNAMES.one
      } else { playerNames[-1] = "Computer" }
      $(".cpuMode").toggleClass('active')
      cpuPlayer *= -1;
   
   });
});

let counter = 0;
function dropAnimation (targetSpc, num) {
   let droppedDiv = $("<div/>");
      if (num === 1) droppedDiv.addClass("player1");
      else droppedDiv.addClass("player2");
      droppedDiv.hide();
      $(droppedDiv).css("position", "absolute")
      droppedDiv.appendTo(".board");
      // let targetSpace = document.getElementById($(this).attr("id"));
      // get position of the element we clicked on
      let offset = $(targetSpc).position();
      
      // get width/height of click element
      // let h = $(this).outerHeight();
      let w = $(targetSpc).outerWidth() ;
      
      // get width/height of drop element
      let dh = droppedDiv.outerHeight() -112 ;
      let dw = droppedDiv.outerWidth();
      
      // determine left position (_elements are drawn from the left first)
      let initLeft = offset.left + ((w/2) - (dw/2));

      // animate drop
      droppedDiv.css({
               left: initLeft,
               top: $(window).scrollTop() - dh,
               opacity: 0,
               display: 'block'
         }).animate({
               left: initLeft,
               top: offset.top - dh,
               opacity: 1
         }, 800, 'easeOutBounce', function () {
            droppedDiv.show()
            
         });
   counter++
}

let shakingElements = [];
let shake = function (element, magnitude = 16, angular = false) {
  //First set the initial tilt angle to the right (+1) 
  let tiltAngle = 1;

  //A counter to count the number of shakes
  counter = 1;

  //The total number of shakes (there will be 1 shake per frame)
  let numberOfShakes = 15;

  //Capture the element's position and angle so you can
  //restore them after the shaking has finished
  let startX = 0,
      startY = 0,
      startAngle = 0;

  // Divide the magnitude into 10 units so that you can 
  // reduce the amount of shake by 10 percent each frame
  let magnitudeUnit = magnitude / numberOfShakes;

  //The `randomInt` helper function
  let randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  //Add the element to the `shakingElements` array if it
  //isn't already there
  if(shakingElements.indexOf(element) === -1) {
    shakingElements.push(element);

    //Add an `updateShake` method to the element.
    //The `updateShake` method will be called each frame
    //in the game loop. The shake effect type can be either
    //up and down (x/y shaking) or angular (rotational shaking).
    if(angular) {
      angularShake();
    } else {
      upAndDownShake();
    }
  }

  //The `upAndDownShake` function
  function upAndDownShake() {

    //Shake the element while the `counter` is less than 
    //the `numberOfShakes`
    if (counter < numberOfShakes) {

      //Reset the element's position at the start of each shake
      element.style.transform = 'translate(' + startX + 'px, ' + startY + 'px)';

      //Reduce the magnitude
      magnitude -= magnitudeUnit;

      //Randomly change the element's position
      let randomX = randomInt(-magnitude, magnitude);
      let randomY = randomInt(-magnitude, magnitude);

      element.style.transform = 'translate(' + randomX + 'px, ' + randomY + 'px)';

      //Add 1 to the counter
      counter += 1;

      requestAnimationFrame(upAndDownShake);
    }

    //When the shaking is finished, restore the element to its original 
    //position and remove it from the `shakingElements` array
    if (counter >= numberOfShakes) {
      element.style.transform = 'translate(' + startX + ', ' + startY + ')';
      shakingElements.splice(shakingElements.indexOf(element), 1);
    }
  }

  //The `angularShake` function
  function angularShake() {
    if (counter < numberOfShakes) {
      //Reset the element's rotation
      element.style.transform = 'rotate(' + startAngle + 'deg)';
      magnitude -= magnitudeUnit;
      //Rotate the element left or right, depending on the direction,
      //by an amount in radians that matches the magnitude
      let angle = Number(magnitude * tiltAngle).toFixed(2);
      element.style.transform = 'rotate(' + angle + 'deg)';
      counter += 1;
      //Reverse the tilt angle so that the element is tilted
      //in the opposite direction for the next shake
      tiltAngle *= -1;
      requestAnimationFrame(angularShake);
    }
    //When the shaking is finished, reset the element's angle and
    //remove it from the `shakingElements` array
    if (counter >= numberOfShakes) {
      element.style.transform = 'rotate(' + startAngle + 'deg)';
      shakingElements.splice(shakingElements.indexOf(element), 1);
      //console.log("removed")
    }
  }
};





