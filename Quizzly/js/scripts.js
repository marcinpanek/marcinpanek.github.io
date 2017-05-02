const jsonURL = new URL('https://cdn.rawgit.com/kdzwinel/cd08d08002995675f10d065985257416/raw/811ad96a0567648ff858b4f14d0096ba241f28ef/quiz-data.json');

let currentQuestion = -1;
let pointCounter = 0;
let questionsLength = -1;
let timerID;
let time;
let qIndexArray;


const mainButton = document.getElementById('main-button');

/*
 * This event listener handles enter to trigger main button
 */
document.addEventListener("keyup", (e) => {
    if (e.keyCode == 13) {
        mainButton.click();
    }
});

/*
 * Event listener for the main button in the app
 * the mechanics of the app happens here
 */
mainButton.addEventListener("click", () => {
    if (currentQuestion === (-1)) {
        startQuiz();
    } else if (currentQuestion === questionsLength) {
        startOverAgain();
    } else {
        const selectedAns = document.querySelector('input[type=radio]:checked');
        if (!selectedAns) {
            displayFlashAllert();
        } else {
            checkSelectedAnswer(selectedAns);    
        }
    }

});


/*
 * Start quiz, fetch data from json, generate questions
 */
function startQuiz() {
    currentQuestion++;
    mainButton.textContent = "Next";

    fetch(jsonURL)
        .then(resp => resp.json())
        .then(data => {
            time = data.time_seconds;
            startTimer(time);
            questionsLength = data.questions.length;
            document.getElementById('points').textContent = "0/" + questionsLength + " Points";

            qIndexArray = [];
            for (let i = 0; i < questionsLength; i++) {
                qIndexArray.push(i);
            }

            /* shuffle the questions */
            qIndexArray.sort(() => {
                return 0.5 - Math.random()
            });

            generateQuestion(qIndexArray.top());
        })
        .catch(e => console.error(e.message));
}

/*
 * Check if the selected answer is correct
 * checks for the end of the quiz
 */
function checkSelectedAnswer(selectedAns) {
    fetch(jsonURL)
        .then(resp => resp.json())
        .then(data => data.questions[qIndexArray.pop()])
        .then(question => question.answers)
        .then(answer => {

            const id = selectedAns.id.slice(-1);
            if (answer[id - 1].correct === true) { pointCounter++; }

            currentQuestion++;
            document.getElementById('points').textContent = pointCounter + "/" + questionsLength + " Points";
            if (currentQuestion < questionsLength) {
                generateQuestion(qIndexArray.top());
            } else {
                showFinishScreen("You've answered all questions!");
            }
        }).catch(e => console.error(e.message));
}

/*
 * Display flash allert with 2 sec timeout
 */
function displayFlashAllert() {
    const parentDiv = document.getElementById('flash-message');

    if (parentDiv.children.length <= 0) {
        const flashDiv = document.createElement('div');
        flashDiv.setAttribute('class', 'sg-flash');

        const flashMessageDiv = document.createElement('div');
        flashMessageDiv.setAttribute('class', 'sg-flash__message sg-flash__message--error js-flash-message');

        const flashTextDiv = document.createElement('div');
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


function generateQuestion(questionID) {
    document.getElementById('head-text').textContent = "Question no " + (currentQuestion + 1);
    fetch(jsonURL)
        .then(response => response.json())
        .then(data => data.questions)
        .then(questions => setQuestion(questions[questionID]))
        .then(answers => setAnswers(answers))
        .catch(error => console.error(error.message));
}

/*
 * Set current question text
 * returns answers array of this question
 */
function setQuestion(questionObj) {
    const questionText = document.getElementById('question-text');
    questionText.textContent = questionObj.question;
    return questionObj.answers;
}


/*
 * Event listener for each radio button
 * change text color when radio selected
 * loops through all radio buttons
 */
function radioOnClick() {
    const radioButtons = document.getElementsByClassName('sg-label');

    for (let i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].firstChild.firstChild.firstChild.checked) {
            radioButtons[i].lastElementChild.setAttribute("class", "sg-text sg-text--standout sg-text--gray");
        } else {
            radioButtons[i].lastElementChild.setAttribute("class", "sg-text sg-text--standout sg-text--light");
        }
    }
}

/*
 * Reset radio buttons, fill with new answers
 * @answers - answers of current question from json
 */
function setAnswers(answers) {
    removeRadioButtons();
    const radioDiv = document.getElementById('radio-box');

    for (let i = 0; i < answers.length; i++) {
        let button = makeRadioButton(answers[i].id, answers[i].answer);
        button.addEventListener("click", radioOnClick);
        radioDiv.appendChild(button);
    }
    radioDiv.firstElementChild.focus();
}

/*
 * Create radio buttons elements
 * @id - number of an answer
 * @text - text of an answer
 */
function makeRadioButton(id, text) {
    const labelWrapper = document.createElement("label");
    labelWrapper.setAttribute('class', "sg-label sg-label--large");

    const iconDiv = document.createElement("div");
    iconDiv.setAttribute("class", "sg-label__icon");

    const radio = document.createElement("div");
    radio.setAttribute("class", "sg-radio");

    const input = document.createElement("input");
    input.setAttribute("class", "sg-radio__element");
    input.type = "radio";
    input.name = "group1";
    input.id = "radio-" + id;

    const label = document.createElement("label");
    label.setAttribute("class", "sg-radio__ghost");
    label.setAttribute("for", "radio-" + id);

    const label2 = document.createElement("label");
    label2.setAttribute("class", "sg-text sg-text--standout sg-text--light");
    label2.setAttribute("for", "radio-" + id);

    label2.appendChild(document.createTextNode(text));
    radio.appendChild(input);
    radio.appendChild(label);
    iconDiv.appendChild(radio);
    labelWrapper.appendChild(iconDiv);
    labelWrapper.appendChild(label2);
    return labelWrapper;
}

/*
 * Start timer
 * @duration - length of countdown in seconds
 */
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
            showFinishScreen("Time is up!");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerID);
    document.getElementById('time').textContent = "";
}


/*
 *  Show the end values screen
 */
function showFinishScreen(headText) {
    stopTimer();
    removeRadioButtons();
    document.getElementById('head-text').textContent = headText;
    const correctText = "You got " + pointCounter + " correct answers!";
    const wrongText = "...and " + (currentQuestion - pointCounter) + " wrong.";
    document.getElementById('question-text').textContent = correctText + " " + wrongText;

    currentQuestion = questionsLength;
    mainButton.textContent = "ONE MORE TRY";
}

/*
 *  Reset app to start values
 */
function startOverAgain() {
    currentQuestion = -1;
    pointCounter = 0;
    const welcomeText = "QUIZZLY QUIZ FOR BRAINLY";
    document.getElementById('head-text').textContent = welcomeText;
    document.getElementById('question-text').textContent = "";
    document.getElementById('points').textContent = "";
    mainButton.textContent = "Start";

}


function removeRadioButtons() {
    const radioNode = document.getElementById('radio-box');
    radioButtons = document.getElementsByClassName('sg-label');
    for (let i = radioButtons.length - 1; i >= 0; i--) {
        radioNode.removeChild(radioButtons[i]);
    }
}


Array.prototype.top = function () {
    return this[this.length - 1];
};
