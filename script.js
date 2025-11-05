// state
let questions = [];
let userAnswers = [];
let current = 0;
let timerInterval = null;
let remainingSecs = 0;
let marked = new Set();

// elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const quizArea = document.getElementById('quizArea');
const introArea = document.getElementById('introArea');
const qIndex = document.getElementById('qIndex');
const qTotal = document.getElementById('qTotal');
const questionText = document.getElementById('questionText');
const optionsList = document.getElementById('optionsList');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const markBtn = document.getElementById('markBtn');
const submitBtn = document.getElementById('submitBtn');
const scoreNow = document.getElementById('scoreNow');
const qnav = document.getElementById('qnav');
const resultArea = document.getElementById('resultArea');
const reviewBtn = document.getElementById('reviewBtn');
const downloadBtn = document.getElementById('downloadBtn');
const certBtn = document.getElementById('certBtn');
const timerEl = document.getElementById('timer');
const timeInput = document.getElementById('timeInput');
const qCountSelect = document.getElementById('qCountSelect');
const generateBtn = document.getElementById('generateBtn');
const sampleBtn = document.getElementById('sampleBtn');
const editBank = document.getElementById('editBank');
const sectionName = document.getElementById('sectionName');
const answeredCountEl = document.getElementById('answeredCount');
const themeToggleBtn = document.getElementById('themeToggle');

function buildPaper(count) {
    // shuffle master
    const pool = [...MASTER_BANK];
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[pool[i], pool[j]] = [pool[j], pool[i]]; }
    questions = pool.slice(0, Math.min(count, pool.length));
    userAnswers = new Array(questions.length).fill(null);
    current = 0; marked = new Set();
    document.getElementById('qTotal').textContent = questions.length;
    renderQuestion(0); updateNav(); updateScore();
}

function renderQuestion(i) {
    const item = questions[i];
    qIndex.textContent = i + 1;
    qTotal.textContent = questions.length;
    sectionName.textContent = item.topic || 'संदर्भ: समग्र';
    questionText.textContent = `${i + 1}. ${item.q}`; // Show question number

    optionsList.innerHTML = '';

    // Option labels: A, B, C, D ...
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    item.options.forEach((opt, idx) => {
        const div = document.createElement('label');
        div.className = 'option';

        // (A) label
        const labelSpan = document.createElement('span');
        labelSpan.className = 'optLabel';
        labelSpan.textContent = `(${optionLabels[idx]}) `;

        // radio input
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'opt' + i;
        input.value = idx;

        if (userAnswers[i] === idx) input.checked = true;

        input.onchange = () => {
            userAnswers[i] = idx;
            // ⭐ IMPROVEMENT: Call lightweight function instead of full updateNav()
            updateNavButton(i);
            updateScore();
        };

        // text span
        const textSpan = document.createElement('span');
        textSpan.className = 'optText';
        textSpan.textContent = opt;

        // Order: (A) [radio] text
        div.appendChild(labelSpan);
        div.appendChild(input);
        div.appendChild(textSpan);

        optionsList.appendChild(div);
    });

    // ⭐ IMPROVEMENT: Update mark button text
    markBtn.textContent = marked.has(i) ? 'अन-मार्क करें' : 'मार्क रिव्यू';
    highlightNav();
}



function updateNav() {
    qnav.innerHTML = '';
    questions.forEach((_, i) => {
        const b = document.createElement('button'); b.className = 'qbutton'; b.textContent = i + 1;
        if (userAnswers[i] !== null) b.classList.add('answered');
        if (marked.has(i)) { b.style.border = '1px dashed #ffd166'; }
        b.onclick = () => { current = i; renderQuestion(current); };
        qnav.appendChild(b);
    });
    answeredCountEl.textContent = userAnswers.filter(a => a !== null).length;
}

// ⭐ IMPROVEMENT: Lightweight function to update a single nav button
function updateNavButton(index) {
    const btn = qnav.children[index]; 
    if (btn) {
        if (userAnswers[index] !== null) {
            btn.classList.add('answered');
        } else {
            btn.classList.remove('answered');
        }
    }
}

function highlightNav() {
    const btns = qnav.querySelectorAll('button'); btns.forEach((b, idx) => { b.style.outline = idx === current ? '2px solid rgba(6,182,212,0.14)' : ''; });
}

function updateScore() { let score = 0; questions.forEach((q, i) => { if (userAnswers[i] === q.answer) score++; }); scoreNow.textContent = score + ' / ' + questions.length; answeredCountEl.textContent = userAnswers.filter(a => a !== null).length; }

function nextQuestion() { if (current < questions.length - 1) { current++; renderQuestion(current); } }
function prevQuestion() { if (current > 0) { current--; renderQuestion(current); } }

// ⭐ IMPROVEMENT: Toggle mark button text
function markForReview() {
    if (marked.has(current)) {
        marked.delete(current);
        markBtn.textContent = 'मार्क फॉर रिव्यू';
    } else {
        marked.add(current);
        markBtn.textContent = 'अन-मार्क करें';
    }
    updateNav(); // Re-render nav buttons to show dashed border
}

function startQuiz() { introArea.classList.add('hidden'); quizArea.classList.remove('hidden'); buildPaper(parseInt(qCountSelect.value)); startTimer(parseInt(timeInput.value || 90)); }

// ⭐ IMPROVEMENT: Add warning for unanswered questions
function submitQuiz() {
    const unanswered = userAnswers.filter(a => a === null).length;
    let confirmMsg = 'क्या आप अपने उत्तर सबमिट करना चाहती हैं?';

    if (unanswered > 0) {
        confirmMsg = `आपने ${questions.length} में से ${unanswered} प्रश्नों का उत्तर नहीं दिया है।\n\nक्या आप फिर भी सबमिट करना चाहती हैं?`;
    }

    if (!confirm(confirmMsg)) return;
    
    stopTimer();
    showResults();
}

function showResults() {
    let score = 0; const rows = [['Q No', 'Question', 'Your Answer', 'Correct Answer', 'Result', 'Topic']];
    
    questions.forEach((q, i) => { 
        const your = userAnswers[i] === null ? 'No Answer' : q.options[userAnswers[i]]; 
        const correct = q.options[q.answer]; 
        const ok = userAnswers[i] === q.answer; 
        if (ok) score++; 
        rows.push([i + 1, q.q, your, correct, ok ? 'Correct' : 'Wrong', q.topic || '']); 
        
        // --- NEW LOGIC TO COLOR NAV BUTTONS ---
        const navButton = qnav.children[i]; // Get the button from the nav bar
        if (navButton) {
            navButton.classList.remove('answered'); // Remove the default 'answered' blue
            
            if (ok) {
                navButton.classList.add('correct'); // Add green class
            } else {
                navButton.classList.add('wrong'); // Add red class
            }
        }
        // --- END OF NEW LOGIC ---
    });
    
    const perc = Math.round((score / questions.length) * 100);
    
    // This function call should be here
    sendResultsToGoogleSheet(score, questions.length, perc, rows); 
    
    resultArea.classList.remove('hidden');
    resultArea.innerHTML = `<div class='result'><strong>स्कोर: ${score} / ${questions.length}</strong> — (${perc}%)</div>`;
    resultArea.innerHTML += `<div style="margin-top:10px"><button id='showAnswers' class='primary'>उत्तर दिखाएँ</button> <button id='downloadCSV'>CSV डाउनलोड</button></div>`;
    
    document.getElementById('showAnswers').onclick = () => { renderReview(); };
    document.getElementById('downloadCSV').onclick = () => { downloadCSV(rows); };

    // Activate the certificate button
    if (certBtn) {
        // certBtn.classList.remove('hidden'); // <-- DELETE THIS LINE
        certBtn.style.display = 'inline-block'; // <-- ADD THIS LINE
        certBtn.onclick = () => {
            alert(`बधाई!\nआपने ${score}/${questions.length} (${perc}%) के साथ टेस्ट पूरा किया।`);
        };
    }
}

function renderReview() {
    quizArea.scrollIntoView({ behavior: 'smooth' }); resultArea.innerHTML = ''; const scoreBox = document.createElement('div'); let score = 0; questions.forEach((q, i) => { if (userAnswers[i] === q.answer) score++; }); scoreBox.className = 'result'; scoreBox.innerHTML = `<strong>स्कोर: ${score} / ${questions.length}</strong> — (${Math.round((score / questions.length) * 100)}%)`; resultArea.appendChild(scoreBox);
    questions.forEach((q, i) => {
        const card = document.createElement('div'); card.style.padding = '8px'; card.style.borderTop = '1px solid rgba(255,255,255,0.03)'; const h = document.createElement('div'); h.style.marginBottom = '6px'; h.textContent = (i + 1) + '. ' + q.q + ' (' + (q.topic || '') + ')'; card.appendChild(h); q.options.forEach((opt, idx) => {
            const el = document.createElement('div'); el.textContent = opt; el.style.padding = '6px'; el.style.borderRadius = '6px'; el.style.marginBottom = '6px'; if (idx === q.answer) { el.style.border = '1px solid rgba(16,185,129,0.3)'; el.style.background = 'rgba(16,185,129,0.04)'; }
            if (userAnswers[i] === idx && userAnswers[i] !== q.answer) { el.style.border = '1px solid rgba(239,68,68,0.22)'; el.style.background = 'rgba(239,68,68,0.04)'; }
            card.appendChild(el);
        }); resultArea.appendChild(card);
    });
}

function downloadCSV(rows) { const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'ccc-mock-result.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

// Timer
function startTimer(minutes) {
    console.log("⏱ Timer started for", minutes, "minutes");
    stopTimer();
    remainingSecs = minutes * 60;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        remainingSecs--;
        updateTimerDisplay(); // Update display
        
        if (remainingSecs <= 0) {
            stopTimer();
            alert('समय समाप्त! आपका पेपर सबमिट हो रहा है।');
            submitQuiz();
        }
    }, 1000);
}
function updateTimerDisplay() { const m = Math.floor(remainingSecs / 60); const s = remainingSecs % 60; timerEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }
function stopTimer() { if (timerInterval) clearInterval(timerInterval); timerInterval = null; }

function resetAll() { if (confirm('क्या आप टेस्ट रीसेट करना चाहते हैं?')) { stopTimer(); introArea.classList.remove('hidden'); quizArea.classList.add('hidden'); resultArea.classList.add('hidden'); userAnswers = []; questions = []; current = 0; } }

// events
startBtn.onclick = () => startQuiz();
nextBtn.onclick = () => nextQuestion();
prevBtn.onclick = () => prevQuestion();
markBtn.onclick = () => { markForReview(); }
submitBtn.onclick = () => submitQuiz();

// 🐛 BUG FIX: Correct pause/resume logic
pauseBtn.onclick = () => {
    if (timerInterval) {
        // Timer is running -> Pause it
        stopTimer();
        pauseBtn.textContent = 'Resume';
    } else {
        // Timer is paused -> Resume it
        if (remainingSecs <= 0) return; // Don't resume a finished quiz

        // Just restart the interval
        timerInterval = setInterval(() => {
            remainingSecs--;
            updateTimerDisplay(); // Display new time

            if (remainingSecs <= 0) {
                stopTimer();
                alert('समय समाप्त! आपका पेपर सबमिट हो रहा है।');
                submitQuiz();
            }
        }, 1000);
        
        pauseBtn.textContent = 'Pause';
    }
};

resetBtn.onclick = () => resetAll();




(function() {
    // This line might cause an error if MASTER_BANK isn't loaded yet.
    // It's better to load it from questions.js
    // document.getElementById('qTotal').textContent = MASTER_BANK.length;
  })();
  
// (function () { document.getElementById('qTotal').textContent = MASTER_BANK.length; buildPaper(100); renderQuestion(0); updateNav(); updateScore(); })();

// ⭐ IMPROVEMENT: Keyboard (Arrow Key) Navigation
document.addEventListener('keydown', (e) => {
    // Ensure the quiz is active
    if (quizArea.classList.contains('hidden')) return;

    // Prevent arrow keys from scrolling the page
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowRight':
            nextQuestion();
            break;
        case 'ArrowLeft':
            prevQuestion();
            break;
    }
});



/**
 * Sends the quiz results to a Formspree endpoint.
 * @param {number} score - The player's score.
 * @param {number} total - The total number of questions.
 * @param {number} percentage - The calculated percentage.
 * @param {Array<Array<string>>} allRows - The full results data.
 */
/**
 * Sends the quiz results to a Google Sheet Web App.
 */
async function sendResultsToGoogleSheet(score, total, percentage, allRows) {
    // ⬇️ *** PASTE YOUR GOOGLE SCRIPT URL HERE ***
    const endpoint = 'https://script.google.com/macros/s/AKfycbwDere9pgLpF1FvRxQtK6zH793aW9KCa0YoUgfInNnSdHjUqFfloddFJ1QEu36pi-VD-A/exec'; 

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            // This is a special way to send data to Google Apps Script
            body: JSON.stringify({
                score: `${score}/${total}`,
                percentage: `${percentage}%`,
                allRows: allRows // Send the full results array
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            console.log('Results successfully sent to Google Sheet.');
        } else {
            console.error('Failed to send results to Google Sheet:', result.message);
        }
    } catch (error) {
        console.error('Error sending results to Google Sheet:', error);
    }
}





// toggle dark mode 



// 
// --- ⬇️ ADD THIS CODE TO THE END OF script.js ⬇️ ---
// 

/**
 * Handles all logic for theme toggling
 */
(function setupThemeToggle() {
    
    // Function to apply the correct theme and button text
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            themeToggleBtn.textContent = '🌙 Dark Mode';
        } else {
            document.body.classList.remove('light-mode');
            themeToggleBtn.textContent = '☀️ Light Mode';
        }
    }

    // 1. Check for a saved theme in localStorage
    let currentTheme = localStorage.getItem('quizTheme') || 'dark'; // Default to dark
    applyTheme(currentTheme);

    // 2. Add the click listener to the button
    themeToggleBtn.onclick = () => {
        // Toggle the current theme
        if (document.body.classList.contains('light-mode')) {
            currentTheme = 'dark';
        } else {
            currentTheme = 'light';
        }
        
        // Save and apply the new theme
        localStorage.setItem('quizTheme', currentTheme);
        applyTheme(currentTheme);
    };

})(); // This runs the setup function immediately