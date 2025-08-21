/*-------------------------------- Constants --------------------------------*/
const fiveLetterWords = ['drive', 'world', 'solid', 'posit', 'local'];

//got this from github
validWords=[]
// URL of the TXT file /* I got this on github and figured out how to use it */
const url = 'https://darkermango.github.io/5-Letter-words/words.txt';

// Fetch the TXT file
fetch(url)
  .then(response => {
    // Check if the response is successful
    if (!response.ok) {
      throw new Error('Status Code: ' + response.statusText);
    }
    return response.text(); // Return the text content
  })
  .then(data => {

     validWords = data
     .split('\n')
    .map(word => word.trim().toLowerCase())
 

    // Example: Log the first 10 words
    console.log('First 10 words:', validWords.slice(0, 10));

    // Log all words (optional)
    // words.forEach(word => console.log(word));
  })
  .catch(error => {
    // Handle errors
    console.error('error:', error);
  });


/*---------------------------- Variables (state) ----------------------------*/
let board = new Array(30).fill('');
let win = false;
let gameLost=false;
let maxGuesses = 6;
let row = 0;
let column = 0;
let targetWord = '';

/*------------------------ Cached Element References ------------------------*/
const squareEls = document.querySelectorAll('.sqr');
console.log(squareEls);
const messageEl = document.querySelector('#message');
console.log(messageEl);
const resetBtnEl = document.querySelector('#reset');
console.log(resetBtnEl);

/*-------------------------------- Functions --------------------------------*/
const init = () => {
  board = new Array(30).fill('');
  win = false;
  gameLost= false; 
  maxGuesses = 6;

  // clear everything first
  squareEls.forEach(function (sqr) {
    sqr.style.color = "black";
    sqr.style.backgroundColor = "";
    sqr.textContent = "";
    sqr.classList.remove("placeholder");
  });


  getRandomWord();
  render();

  

  const placeHolderWords = ["YMCA!", "Poop!", "W0W!!", "Gross", "Bacon", "Doing!", "Babe!"];
  const funnyIndex = Math.floor(Math.random() * placeHolderWords.length);

  // put the chosen word’s letters into the first row
  for (let i = 0; i < 5; i++) {
    squareEls[i].textContent = placeHolderWords[funnyIndex][i];
    squareEls[i].classList.add("placeholder");
    board[i] = "";  // keep empty so typing still works
    
    messageEl.textContent = "Start typing now!";//get start typing showing but don't mess up other messages
  
  
  }
};

const render = () => {
  updateBoard();
  updateMessage();
};

const updateBoard = () => {
  board.forEach((element, idx) => {
    const sq = squareEls[idx];
    sq.innerText = element;
  });

  console.log("game updated");
};

const updateMessage = () => {

  if (win && maxGuesses === 6) {
    messageEl.textContent = "Play the Lottery today 🤯 !!!";
  } else if (win && maxGuesses === 5) {
    messageEl.textContent = "Magnificent";
  } else if (win && maxGuesses === 4) {
    messageEl.textContent = "Splendid";
  } else if (win && maxGuesses === 3) {
    messageEl.textContent = "Solid";
  } else if (win && maxGuesses === 2) {
    messageEl.textContent = "Great";
  } else if (win && maxGuesses === 1) {
    messageEl.textContent = "Phew";
  }

};

const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * fiveLetterWords.length);
  const randomWord = fiveLetterWords[randomIndex];
  console.log(randomWord);
  targetWord = randomWord;
  return randomWord;
};

const handleLetter = (event) => {
  const letter = event.key.toLowerCase(); 
  const index = calculateTileIndex(row, column);

  //submit somthing--but check against the github list
  if (event.key === 'Enter' && column === 5) {
    const guessWord = submitGuess();

    if (!validWords.includes(guessWord)) {
    messageEl.textContent = `"${guessWord}" is not a valid word! Backspace your way out!`;
    return; // won't go on but user will see if they had a letter right
  }// not sure is that fair? 🤔

    const result = scoreGuess(guessWord);

    if (checkForWin(guessWord, targetWord)) {
      win = true;
      updateMessage();
    } else if (maxGuesses === 0) {
      checkForLost(guessWord);
    } else {
      row++;
      column = 0;
    }

  // Backspace: delete last
  } else if (event.key === 'Backspace' && column > 0) {
    column--;
    let index = calculateTileIndex(row, column);
    board[index] = '';

  
  } else if (/^[a-z]$/i.test(event.key)) {
    if (column < 5) {
      placeLetter(letter, index);
    }

    //messages of encouragment/instruction
    if (board.some(cell => cell !== '') && column < 5) {
    messageEl.textContent = "Rock on!";
  } else if (column === 5 && !gameLost) {
    messageEl.textContent = "Hit Enter!";
  }
}

  render();
};


const placeLetter = (letter, index) => {
  if (board[index] === '' && column < 5) {
    board[index] = letter;
    squareEls[index].textContent = letter;
    squareEls[index].classList.remove("placeholder");
    column++;
    return letter;
  }
};

// row = ⌊index / 5⌋, col = index % 5 (and index = row * 5 + col).
const calculateTileIndex = (row, column) => {
  let currentIndex = row * 5 + column;
  return currentIndex;
};

const submitGuess = () => {
  let start = row * 5;
  let end = start + 5;
  let guess = board.slice(start, end).join('');

  let result = scoreGuess(guess);
  console.log(result);
  maxGuesses = maxGuesses - 1;
  return guess;
};

const scoreGuess = (guess) => {
  let status = Array(5).fill('absent');
  const guessWord = guess.toLowerCase();
  const secretWord = targetWord.toLowerCase();

  const secretArrayLetters = secretWord.split('');

  if (guess.length === 5) {
    const remainingLetters = secretArrayLetters.reduce((acc, currentLetter, idx) => {
      if (guessWord[idx] === secretWord[idx]) {
        status[idx] = 'success'; // green
      } else {
        acc[currentLetter] = (acc[currentLetter] || 0) + 1;
      }
      return acc;
    }, {});

    // the yellow letters
    for (let i = 0; i < secretWord.length; i++) {
      if (status[i] !== 'success') {
        const letter = guessWord[i];
        if (remainingLetters[letter] > 0) {
          status[i] = 'present';
          remainingLetters[letter] -= 1;
        }
      }
    }

    let startRow = row * 5;
    let endRow = startRow + 5;

    for (let i = 0; i < 5; i++) {
      if (status[i] === 'success') {
        squareEls[startRow + i].style.backgroundColor = "green";
        squareEls[startRow + i].style.color = "white";
      } else if (status[i] === 'present') {
        squareEls[startRow + i].style.backgroundColor = "yellow";
        squareEls[startRow + i].style.color = "white";
      } else {
        squareEls[startRow + i].style.backgroundColor = "grey";
        squareEls[startRow + i].style.color = "white";
      }
    }
  }

  return status;
};

const checkForWin = (guess, target) => {
  if (guess.length === 5) {
    return guess.toLowerCase() === target.toLowerCase();
  }
  return false;
};

const checkForLost = (guess) => {
  if (maxGuesses === 0 && guess.length === 5 && !win) {
    gameLost = true; 
    messageEl.textContent = `Next Time! The word was ${targetWord.toUpperCase()}`
  }
};


init();

/*-------------------------------- Listeners --------------------------------*/
const handleKeyPress = (event) => {
  if(!gameLost){
  handleLetter(event);
  }
};

document.addEventListener("keydown", handleKeyPress);

resetBtnEl.addEventListener('click', init);