// --- 1. Define Questions ---
const questions = [
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Berlin", correct: false },
            { text: "Madrid", correct: false },
            { text: "Paris", correct: true },
            { text: "Rome", correct: false }
        ]
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: [
            { text: "Earth", correct: false },
            { text: "Mars", correct: true },
            { text: "Jupiter", correct: false },
            { text: "Venus", correct: false }
        ]
    },
    {
        question: "What is the largest mammal in the world?",
        answers: [
            { text: "Elephant", correct: false },
            { text: "Great White Shark", correct: false },
            { text: "Giraffe", correct: false },
            { text: "Blue Whale", correct: true }
        ]
    },
    {
        question: "What is 2 + 2?",
        answers: [
            { text: "4", correct: true },
            { text: "22", correct: false },
            { text: "3", correct: false },
            { text: "5", correct: false }
        ]
    }
];

// --- 2. Get HTML Elements ---
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const timerElement = document.getElementById("timer"); // New

// --- 3. Initialize State ---
let currentQuestionIndex = 0;
let score = 0;

// --- Timer Variables ---
const TOTAL_TIME = 60; // Total time for the quiz in seconds (e.g., 60 seconds)
let timeLeft = TOTAL_TIME;
let timerInterval; // Will hold the interval ID

/**
 * Starts the quiz.
 */
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
    startTimer(); // Start the countdown
}

/**
 * Resets and starts the countdown timer.
 */
function startTimer() {
    timeLeft = TOTAL_TIME; // Reset time
    timerElement.style.display = "block"; // Show timer
    
    // Clear any existing timer
    clearInterval(timerInterval); 

    // Start a new timer that ticks every second
    timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Called every second to update the timer display.
 */
function updateTimer() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval); // Stop the timer
        showScore(); // End the quiz
    } else {
        timeLeft--;
        // Format time as MM:SS
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.innerHTML = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

/**
 * Displays the current question and its answers.
 */
function showQuestion() {
    resetState(); // Clear previous question/answers

    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtonsElement.appendChild(button);

        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

/**
 * Hides the "Next" button and removes all old answer buttons.
 */
function resetState() {
    nextButton.style.display = "none";
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

/**
 * Handles the logic when a user clicks an answer.
 */
function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }

    // Show the correct answer and disable all buttons
    Array.from(answerButtonsElement.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    nextButton.style.display = "block";
}

/**
 * Displays the final score.
 */
function showScore() {
    // Stop the timer and hide it
    clearInterval(timerInterval);
    timerElement.style.display = "none";

    resetState(); // Clear the board

    // Calculate percentage
    const percentage = ((score / questions.length) * 100).toFixed(1);

    // Display final score and result summary
    questionElement.innerHTML = `Quiz Complete!
        <br>
        You scored <strong>${score}</strong> out of <strong>${questions.length}</strong> (${percentage}%)
    `;
    
    // Add custom message based on score
    let resultMessage = "";
    if (percentage > 80) {
        resultMessage = "Excellent work!";
    } else if (percentage >= 50) {
        resultMessage = "Good job, you passed!";
    } else {
        resultMessage = "Better luck next time!";
    }
    questionElement.innerHTML += `<br><br>${resultMessage}`;


    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";
}

/**
 * Handles the "Next" button click logic.
 */
function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore(); // Quiz is over
    }
}

// --- 5. Event Listeners ---

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        // If quiz is over, clicking "Play Again" restarts it
        startQuiz(); 
    }
});

// --- 6. Start the Quiz ---
startQuiz();