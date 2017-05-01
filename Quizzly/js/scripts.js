const jsonURL = new URL('https://cdn.rawgit.com/kdzwinel/cd08d08002995675f10d065985257416/raw/811ad96a0567648ff858b4f14d0096ba241f28ef/quiz-data.json');

let currentQuestion = -1;
let pointCounter = 0;
let questionsLength = -1;
let timerID;
let time;
let qIndexArray;

const button = document.getElementById('main-button');

// 
// Event listener for the main button in the app
// the mechanics of the app happens here
// 
button.addEventListener("click", () => {
    if (currentQuestion === (-1)) {
        startQuiz();
    } else if (currentQuestion === questionsLength) {
        startOverAgain();
    } else {
        const selectedAns = document.querySelector('input[type=radio]:checked');
        if (!selectedAns) {
            displayFlashAllert();
        }
        else{
            checkSelectedAnswer(selectedAns);    
        }
    }
});

// 
// Start quiz, fetch data from json, generate questons
// 
function startQuiz() {
    currentQuestion++;
    button.textContent = "Next";

    fetch(jsonURL)
        .then(resp => resp.json())
        .then(data => {
            time = data.time_seconds;
            startTimer(time);
            questionsLength = data.questions.length;
            document.getElementById('points').textContent = "0" + "/" + questionsLength + " Points";

            qIndexArray = [];
            for (let i = 0; i < questionsLength; i++) {
                qIndexArray.push(i);
            }
            qIndexArray.sort(() => {
                return 0.5 - Math.random()
            });

            generateQuestion(qIndexArray.top());
        })
        .catch(e => console.error(e.message));
}

// 
// Check if selected answer is correct
// checks for the end of the game
// 
function checkSelectedAnswer(selectedAns) {
    fetch(jsonURL)
        .then(resp => resp.json())
        .then(data => data.questions[qIndexArray.pop()])
        .then(question => question.answers)
        .then(answer => {
            let id = selectedAns.id.slice(-1);
            if (answer[id - 1].correct === true) { pointCounter++; }

            currentQuestion++;
            document.getElementById('points').textContent = pointCounter + "/" + questionsLength + " Points";
            if (currentQuestion < questionsLength) {
                generateQuestion(qIndexArray.top());
                
            } else {
                endItAll();
            }
            
        }).catch(e => console.error(e.message));
}

// 
// Display flash allert with 2 sec timeout
// 
function displayFlashAllert() {
    let parentDiv = document.getElementById('flash-message');

    if (parentDiv.children.length <= 0) {
        let flashDiv = document.createElement('div');
        flashDiv.setAttribute('class', 'sg-flash');

        let flashMessageDiv = document.createElement('div');
        flashMessageDiv.setAttribute('class', 'sg-flash__message sg-flash__message--error js-flash-message');

        let flashTextDiv = document.createElement('div');
        flashTextDiv.setAttribute('class', 'sg-text sg-text--small sg-text--emphasised sg-text--light');

        flashTextDiv.textContent = "Select the answer!";

        flashMessageDiv.appendChild(flashTextDiv);
        flashDiv.appendChild(flashMessageDiv);
        parentDiv.appendChild(flashDiv);

        setTimeout(() => {
            flashMessageDiv.removeChild(flashTextDiv);
            flashDiv.removeChild(flashMessageDiv);
            parentDiv.removeChild(flashDiv);
        }, 2000);
    }
}

// 
// Fetch single question
// 
function generateQuestion(questionID) {
    document.getElementById('head-text').textContent = "Question no " + (currentQuestion + 1);
    fetch(jsonURL)
        .then(response => response.json())
        .then(data => data.questions)
        .then(questions => setQuestion(questions[questionID]))
        .then(answers => setAnswers(answers))
        .catch(error => console.error(error.message));
}

// 
// Set current queston text
// return answers of this question
// 
function setQuestion(questionObj) {
    const questionText = document.getElementById('question-text');
    questionText.textContent = questionObj.question;
    return questionObj.answers;
}

// 
// Reset radio buttons, fill with new answers
// answersObj - answers of current question from json
// 
function setAnswers(answersObj) {
    removeRadioButtons();
    const radioDiv = document.getElementById('radio-box');

    for (let i = 0; i < answersObj.length; i++) {
        let button = makeRadioButton(answersObj[i].id, answersObj[i].answer);
        button.addEventListener("click", () => {
            // 
            // Event listener for each radio button
            // change text color when radio selected
            // loops through all radio buttons
            //             
            let radioButtons = document.getElementsByClassName('sg-label');
            for (let i = 0; i < radioButtons.length; i++) {
                if(radioButtons[i].firstChild.firstChild.firstChild.checked){
                    radioButtons[i].lastElementChild.setAttribute("class", "sg-text sg-text--standout sg-text--gray");
                }
                else{
                    radioButtons[i].lastElementChild.setAttribute("class", "sg-text sg-text--standout sg-text--light");
                }
            }
        });
        radioDiv.appendChild(button);
    }
}

// 
// Create radio buttons elements
// id - number of an answer
// text - text of an answer
// 
function makeRadioButton(id, text) {
    let parentDiv = document.createElement("div");
    parentDiv.setAttribute('class', "sg-label sg-label--large");

    let iconDiv = document.createElement("div");
    iconDiv.setAttribute("class", "sg-label__icon");

    let radio = document.createElement("div");
    radio.setAttribute("class", "sg-radio");

    let input = document.createElement("input");
    input.setAttribute("class", "sg-radio__element");
    input.type = "radio";
    input.name = "group1";
    input.id = "radio-" + id;

    let label = document.createElement("label");
    label.setAttribute("class", "sg-radio__ghost");
    label.setAttribute("for", "radio-" + id);

    let label2 = document.createElement("label");
    label2.setAttribute("class", "sg-text sg-text--standout sg-text--light");
    label2.setAttribute("for", "radio-" + id);

    label2.appendChild(document.createTextNode(text));
    radio.appendChild(input);
    radio.appendChild(label);
    iconDiv.appendChild(radio);
    parentDiv.appendChild(iconDiv);
    parentDiv.appendChild(label2);
    return parentDiv;
}

// 
// Start timer
// duration - length of countdown in seconds
// 
function startTimer(duration) {
    const display = document.getElementById('time');
    let timer = duration;
    let minutes;
    let seconds;
    timerID = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            endItAll("Time is up!");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerID);
    document.getElementById('time').textContent = "";
}


// 
// Show the end values screen
// 
function endItAll() {
    stopTimer();
    removeRadioButtons();
    document.getElementById('head-text').textContent = "You've answered all questions!";

    const correctText = "You got " + pointCounter + " correct answers!";
    const wrongText = "...and " + (currentQuestion - pointCounter) + " wrong.";
    document.getElementById('question-text').textContent = correctText + " " + wrongText;

    currentQuestion = questionsLength;
    button.textContent = "ONE MORE TRY";
}

// 
// Reset app to start values
// 
function startOverAgain() {
    currentQuestion = -1;
    pointCounter = 0;
    const welcomeText = "QUIZZLY QUIZZ FOR BRAINLY";
    document.getElementById('head-text').textContent = welcomeText;
    document.getElementById('question-text').textContent = "";
    document.getElementById('points').textContent = "";
    button.textContent = "Start";

}

// 
// Remove radio buttons
// selecring child nodes by class name because when selecting
// as list of child nodes, first child node is a text field
// 
function removeRadioButtons() {
    const radioNode = document.getElementById('radio-box');
    radioButtons = document.getElementsByClassName('sg-label');
    for (let i = radioButtons.length - 1; i >= 0; i--) {
        radioNode.removeChild(radioButtons[i]);
    }
}

// 
// Define Array top()
// 
Array.prototype.top = function () {
    return this[this.length - 1];
};