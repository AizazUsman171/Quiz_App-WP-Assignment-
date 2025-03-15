document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const breadcrumbNav = document.getElementById('breadcrumb-nav');
    
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const timerBonus = document.getElementById('timer-bonus');
    const timerCount = document.getElementById('timer-count');
    const currentQuestion = document.getElementById('current-question');
    const totalQuestions = document.getElementById('total-questions');
    const totalQuestionsResult = document.getElementById('total-questions-result');
    const currentScore = document.getElementById('current-score');
    const mnemonicDisplay = document.getElementById('mnemonic-display');
    const hintText = document.getElementById('hint-text');
    const optionsElements = document.querySelectorAll('.option');
    
    const correctAnswers = document.getElementById('correct-answers');
    const totalPoints = document.getElementById('total-points');
    const playAgainBtn = document.getElementById('play-again-btn');
    const playAgainBtn2 = document.getElementById('play-again-btn2');
    
    const tabItems = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Quiz data
    const quizData = [
        {
            mnemonic: "Never Eat Shredded Wheat",
            options: [
                { text: "compass directions", correct: true },
                { text: "ancient grains", correct: false },
                { text: "Allied powers in World War II", correct: false },
                { text: "presidents represented on Mount Rushmore", correct: false }
            ],
            hint: "Starting at the top and going clockwise, compass directions are north, east, south, and west."
        },
        {
            mnemonic: "ROY G. BIV",
            options: [
                { text: "what to do in case of a fire", correct: false },
                { text: "trigonometric functions", correct: false },
                { text: "colors of the rainbow", correct: true },
                { text: "organ systems of the human body", correct: false }
            ],
            hint: "Starting from the outside and working inward, a rainbow's colors are traditionally broken up into red, orange, yellow, green, blue, indigo, and violet."
        },
        {
            mnemonic: "My Very Eager Mother Just Served Us Nachos",
            options: [
                { text: "planets in the solar system", correct: true },
                { text: "Great Lakes of North America", correct: false },
                { text: "Seven Wonders of the Ancient World", correct: false },
                { text: "taxonomic classification levels", correct: false }
            ],
            hint: "In order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
        },
        {
            mnemonic: "Please Excuse My Dear Aunt Sally",
            options: [
                { text: "types of plants", correct: false },
                { text: "order of operations in math", correct: true },
                { text: "classification of living things", correct: false },
                { text: "elements in the periodic table", correct: false }
            ],
            hint: "Parentheses, Exponents, Multiplication/Division, Addition/Subtraction."
        },
        {
            mnemonic: "HOMES",
            options: [
                { text: "types of government", correct: false },
                { text: "parts of a cell", correct: false },
                { text: "Great Lakes", correct: true },
                { text: "branches of science", correct: false }
            ],
            hint: "The five Great Lakes: Huron, Ontario, Michigan, Erie, Superior."
        }
    ];
    
    // Quiz variables
    let currentQuizIndex = 0;
    let score = 0;
    let timerInterval;
    let timeRemaining = 30;
    let isTimerActive = true;
    let selectedOption = null;
    let correctCount = 0;
    let timeBonus = 0;

    // Event listeners
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', goToNextQuestion);
    playAgainBtn.addEventListener('click', restartQuiz);
    playAgainBtn2.addEventListener('click', restartQuiz);
    
    optionsElements.forEach(option => {
        option.addEventListener('click', () => {
            if (!option.classList.contains('correct') && !option.classList.contains('incorrect')) {
                selectOption(option);
            }
        });
    });
    
    // Tab switching
    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all tabs
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Functions
    function startQuiz() {
        startScreen.classList.add('d-none');
        quizScreen.classList.remove('d-none');
        breadcrumbNav.classList.remove('d-none');
        
        // Set up first question
        loadQuestion(currentQuizIndex);
        
        // Display total questions
        totalQuestions.textContent = quizData.length;
        
        // Start timer if timer bonus is checked
        isTimerActive = timerBonus.checked;
        if (isTimerActive) {
            startTimer();
        } else {
            timerCount.parentElement.style.display = 'none';
        }
    }
    
    function loadQuestion(index) {
        // Reset option states
        optionsElements.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
            option.querySelector('.correct-icon').classList.add('d-none');
            option.querySelector('.incorrect-icon').classList.add('d-none');
        });
        
        // Reset timer
        clearInterval(timerInterval);
        timeRemaining = 30;
        if (isTimerActive) {
            timerCount.textContent = timeRemaining;
            startTimer();
        }
        
        // Enable options
        optionsElements.forEach(option => {
            option.style.pointerEvents = 'auto';
        });
        
        // Disable next button
        nextBtn.disabled = true;
        selectedOption = null;
        
        // Load current question data
        const currentQuizData = quizData[index];
        mnemonicDisplay.textContent = currentQuizData.mnemonic;
        hintText.textContent = currentQuizData.hint;
        
        // Set options
        for (let i = 0; i < optionsElements.length; i++) {
            const optionText = optionsElements[i].querySelector('.option-text');
            optionText.textContent = currentQuizData.options[i].text;
            
            // Set data attribute for correct option
            if (currentQuizData.options[i].correct) {
                optionsElements[i].setAttribute('data-correct', 'true');
            } else {
                optionsElements[i].removeAttribute('data-correct');
            }
        }
        
        // Update question counter
        currentQuestion.textContent = index + 1;
    }
    
    function selectOption(option) {
        // Clear any previously selected option
        optionsElements.forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Mark this option as selected
        option.classList.add('selected');
        selectedOption = option;
        
        // Enable next button
        nextBtn.disabled = false;
        
        // Check answer
        checkAnswer();
    }
    
    function checkAnswer() {
        // Disable all options to prevent changing answer
        optionsElements.forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Stop timer
        clearInterval(timerInterval);
        
        // Calculate timer bonus
        if (isTimerActive) {
            const thisQuestionBonus = timeRemaining * 10;
            timeBonus += thisQuestionBonus;
        }
        
        // Check if selected option is correct
        const isCorrect = selectedOption.hasAttribute('data-correct');
        
        if (isCorrect) {
            selectedOption.classList.add('correct');
            selectedOption.querySelector('.correct-icon').classList.remove('d-none');
            score += 400; // Base score for correct answer
            correctCount++;
        } else {
            selectedOption.classList.add('incorrect');
            selectedOption.querySelector('.incorrect-icon').classList.remove('d-none');
            
            // Show which one was correct
            optionsElements.forEach(option => {
                if (option.hasAttribute('data-correct')) {
                    option.classList.add('correct');
                    option.querySelector('.correct-icon').classList.remove('d-none');
                }
            });
        }
        
        // Update score display
        currentScore.textContent = score;
    }
    
    function goToNextQuestion() {
        currentQuizIndex++;
        
        if (currentQuizIndex < quizData.length) {
            loadQuestion(currentQuizIndex);
        } else {
            showResults();
        }
    }
    
    function showResults() {
        quizScreen.classList.add('d-none');
        resultsScreen.classList.remove('d-none');
        breadcrumbNav.classList.add('d-none');
        
        // Update results data
        correctAnswers.textContent = correctCount;
        totalQuestionsResult.textContent = quizData.length;
        
        // Calculate final score with time bonus
        const finalScore = score + timeBonus;
        totalPoints.textContent = finalScore;
        
        // Update score breakdown in leaderboard tab
        document.querySelector('.score-item:nth-child(1) .score-value').textContent = `${score} Points`;
        document.querySelector('.score-item:nth-child(2) .score-value').textContent = `${timeBonus} Points`;
        document.querySelector('.total-score .score-number').textContent = finalScore;
        document.querySelector('.your-score-display span:last-child').textContent = finalScore;
    }
    
    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeRemaining--;
            timerCount.textContent = timeRemaining;
            
            // Update timer color based on time remaining
            if (timeRemaining <= 10) {
                timerCount.parentElement.style.borderColor = '#dc3545';
                timerCount.style.color = '#dc3545';
            } else {
                timerCount.parentElement.style.borderColor = '#28a745';
                timerCount.style.color = '#28a745';
            }
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                
                // Auto-select random option if time runs out
                if (!selectedOption) {
                    const randomOption = optionsElements[Math.floor(Math.random() * optionsElements.length)];
                    selectOption(randomOption);
                }
            }
        }, 1000);
    }
    
    function restartQuiz() {
        // Reset quiz state
        currentQuizIndex = 0;
        score = 0;
        correctCount = 0;
        timeBonus = 0;
        currentScore.textContent = 0;
        
        // Show start screen
        resultsScreen.classList.add('d-none');
        startScreen.classList.remove('d-none');
    }
    
    // Initialize the quiz
    function init() {
        // Shuffle quiz data
        shuffleArray(quizData);
        
        // Set initial value for total questions
        totalQuestions.textContent = quizData.length;
        totalQuestionsResult.textContent = quizData.length;
    }
    
    // Utility function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Initialize the quiz
    init();
});