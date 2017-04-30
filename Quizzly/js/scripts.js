const jsonURL = new URL('https://cdn.rawgit.com/kdzwinel/cd08d08002995675f10d065985257416/raw/811ad96a0567648ff858b4f14d0096ba241f28ef/quiz-data.json');

let currentQuestion = -1;
let pointCounter = 0;
let questionsLength = -1;
let timerID;
let time;
let qIndexArray;

const button = document.getElementsByClassName('sg-button-primary')[0];
button.addEventListener("click", () => {
    if (currentQuestion === (-1)) {
        currentQuestion++;
        
        button.textContent = "Next";

        fetch(jsonURL)
            .then(resp => resp.json())
            .then(data => {
                time = data.time_seconds;
                startTimer(time, document.getElementById('time'));
                questionsLength = data.questions.length;

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
            
        return;
    } else if (currentQuestion === questionsLength) {
        return startOverAgain();
    }

    let selectedAns = document.querySelector('input[type=radio]:checked');
    if (!selectedAns) {
        displayFlashAllert();
        return;
    }

    fetch(jsonURL)
        .then(resp => resp.json())
        .then(data => data.questions[qIndexArray.pop()])
        .then(question => question.answers)
        .then(answer => {

            let id = selectedAns.id.slice(-1);

            if (answer[id - 1].correct === true) {
                pointCounter++;
            }

            currentQuestion++;
            if (currentQuestion < questionsLength) {
                generateQuestion(qIndexArray.top());
            } else {
                endItAll("You've answered all questions!");
            }
        }).catch(e => console.error(e.message))


});


Array.prototype.top = function () {
    return this[this.length - 1];
};

function displayFlashAllert() {
    let parentDiv = document.getElementsByClassName('flash-messages-container')[0];

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

function generateQuestion(questionID) {
    document.getElementsByClassName('sg-text-bit')[1].innerText = "Question no " + (currentQuestion + 1);
    fetch(jsonURL)
        .then(response => response.json())
        .then(data => data.questions)
        .then(questions => setQuestion(questions[questionID]))
        .then(answers => setAnswers(answers))
        .catch(error => console.error(error.message))
}


function setQuestion(questionObj) {
    const questionText = document.getElementsByClassName('sg-text--headline')[0];
    questionText.innerText = questionObj.question;
    return questionObj.answers;
}


function setAnswers(answersObj) {
    removeRadioButtons();

    const radioDiv = document.getElementsByClassName('sg-content-box__content')[0];


    for (let i = 0; i < answersObj.length; i++) {
        let button = makeRadioButton(answersObj[i].id, answersObj[i].answer);
        radioDiv.appendChild(button);
    }

}


function makeRadioButton(id, text) {
    let parentDiv = document.createElement("div");
    parentDiv.setAttribute('class', "sg-label");

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
    label2.setAttribute("class", "sg-label__text");
    label2.setAttribute("for", "radio-" + id);

    label2.appendChild(document.createTextNode(text));
    radio.appendChild(input);
    radio.appendChild(label);
    iconDiv.appendChild(radio);
    parentDiv.appendChild(iconDiv);
    parentDiv.appendChild(label2);
    return parentDiv;
}


function startTimer(duration, display) {
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
    document.getElementsByClassName('sg-text-bit')[0].textContent = "";
}


function endItAll(headText) {
    stopTimer();
    removeRadioButtons();

    document.getElementsByClassName('sg-text-bit')[1].textContent = headText;

    const correctText = "You got " + pointCounter + " correct answers!";
    const wrongText = "...and " + (currentQuestion - pointCounter) + " wrong.";
    document.getElementsByClassName('sg-text--headline')[0].textContent = correctText + " " + wrongText;

    currentQuestion = questionsLength;
    button.textContent = "ONE MORE TRY";
}


function startOverAgain() {
    currentQuestion = -1;
    pointCounter = 0;
    const welcomeText = "QUIZZLY QUIZZ FOR BRAINLY";
    document.getElementsByClassName('sg-text-bit')[1].textContent = welcomeText;
    document.getElementsByClassName('sg-text--headline')[0].textContent = "";
    button.textContent = "Start";

}


function removeRadioButtons() {
    const radioDiv = document.getElementsByClassName('sg-content-box__content')[0];

    let radioButtons = document.getElementsByClassName('sg-label');
    for (let i = radioButtons.length - 1; i >= 0; i--) {
        radioDiv.removeChild(radioButtons[i]);
    }
}
