// Elementi
const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start');
const timerPauseBtn = document.getElementById('timer-pause');
const timerResetBtn = document.getElementById('timer-reset');
const timerModeToggle = document.getElementById('timer-mode-toggle');
const pomodoroSkipBtn = document.getElementById('pomodoro-skip');

const customSection = document.getElementById('timer-custom-section');
const pomodoroSection = document.getElementById('timer-pomodoro-section');

const hoursInput = document.getElementById('timer-hours');
const minutesInput = document.getElementById('timer-minutes');
const secondsInput = document.getElementById('timer-seconds');

const pomodoroPhaseEl = document.getElementById('pomodoro-phase');
const pomodoroCountEl = document.getElementById('pomodoro-count');

// Stāvoklis
let mode = 'custom';            // 'custom' vai 'pomodoro'
let intervalId = null;
let remainingSeconds = 0;
let isRunning = false;
let isPaused = false;

// Pomodoro konstantes (sekundes)
const POMODORO_WORK = 25 * 60;
const POMODORO_SHORT_BREAK = 5 * 60;
const POMODORO_LONG_BREAK = 15 * 60;

let pomodoroPhase = 'work';     // 'work', 'short', 'long'
let completedSessions = 0;

// === DISPLEJS ===
function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = n => String(n).padStart(2, '0');
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
    document.title = isRunning
        ? `${formatTime(remainingSeconds)} — Taimeris`
        : 'Mācību plānotājs';
}

// === VADĪBA ===
function startTimer() {
    if (isRunning) return;

    // Pirmā palaišana — paņem ilgumu
    if (!isPaused) {
        if (mode === 'custom') {
            const h = parseInt(hoursInput.value) || 0;
            const m = parseInt(minutesInput.value) || 0;
            const s = parseInt(secondsInput.value) || 0;
            remainingSeconds = h * 3600 + m * 60 + s;
            if (remainingSeconds <= 0) return;
        } else if (remainingSeconds <= 0) {
            setPomodoroPhase(pomodoroPhase);
        }
    }

    isRunning = true;
    isPaused = false;
    timerDisplay.classList.add('running');

    intervalId = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        if (remainingSeconds <= 0) timerFinished();
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    clearInterval(intervalId);
    isRunning = false;
    isPaused = true;
    timerDisplay.classList.remove('running');
    document.title = 'Mācību plānotājs';
}

function resetTimer() {
    clearInterval(intervalId);
    isRunning = false;
    isPaused = false;
    timerDisplay.classList.remove('running');

    if (mode === 'custom') {
        remainingSeconds = 0;
        updateDisplay();
    } else {
        // Pomodoro: atiestata uz darba sesijas sākumu un noliek skaitītāju nullē
        completedSessions = 0;
        updatePomodoroCount();
        setPomodoroPhase('work');
    }
    document.title = 'Mācību plānotājs';
}

function timerFinished() {
    clearInterval(intervalId);
    isRunning = false;
    isPaused = false;
    timerDisplay.classList.remove('running');

    if (mode === 'custom') {
        setTimeout(() => alert('⏰ Taimeris pabeigts!'), 100);
    } else {
        if (pomodoroPhase === 'work') {
            completedSessions++;
            updatePomodoroCount();
            if (completedSessions % 4 === 0) {
                setPomodoroPhase('long');
                setTimeout(() => alert('🎉 4 darba sesijas pabeigtas! Laiks garai pauzei (15 min).'), 100);
            } else {
                setPomodoroPhase('short');
                setTimeout(() => alert('✅ Darba sesija pabeigta! Laiks īsai pauzei (5 min).'), 100);
            }
        } else {
            setPomodoroPhase('work');
            setTimeout(() => alert('☕ Pauze beigusies! Laiks darbam (25 min).'), 100);
        }
    }
}

// === POMODORO ===
function setPomodoroPhase(phase) {
    pomodoroPhase = phase;
    pomodoroPhaseEl.className = `pomodoro-phase ${phase}`;
    if (phase === 'work') {
        remainingSeconds = POMODORO_WORK;
        pomodoroPhaseEl.textContent = 'Darbs';
    } else if (phase === 'short') {
        remainingSeconds = POMODORO_SHORT_BREAK;
        pomodoroPhaseEl.textContent = 'Īsa pauze';
    } else {
        remainingSeconds = POMODORO_LONG_BREAK;
        pomodoroPhaseEl.textContent = 'Gara pauze';
    }
    updateDisplay();
}

function updatePomodoroCount() {
    pomodoroCountEl.textContent = `Pabeigtas: ${completedSessions}`;
}

function skipPomodoroPhase() {
    clearInterval(intervalId);
    isRunning = false;
    isPaused = false;
    timerDisplay.classList.remove('running');

    if (pomodoroPhase === 'work') {
        completedSessions++;
        updatePomodoroCount();
        if (completedSessions % 4 === 0) setPomodoroPhase('long');
        else setPomodoroPhase('short');
    } else {
        setPomodoroPhase('work');
    }
}

// === REŽĪMA PĀRSLĒGŠANA ===
function toggleMode() {
    clearInterval(intervalId);
    isRunning = false;
    isPaused = false;
    timerDisplay.classList.remove('running');

    if (mode === 'custom') {
        mode = 'pomodoro';
        customSection.style.display = 'none';
        pomodoroSection.style.display = 'block';
        pomodoroSkipBtn.style.display = 'inline-flex';
        timerModeToggle.textContent = 'Parastais taimeris';
        completedSessions = 0;
        updatePomodoroCount();
        setPomodoroPhase('work');
    } else {
        mode = 'custom';
        customSection.style.display = 'block';
        pomodoroSection.style.display = 'none';
        pomodoroSkipBtn.style.display = 'none';
        timerModeToggle.textContent = 'Pārslēgt uz Pomodoro';
        remainingSeconds = 0;
        updateDisplay();
    }
}

// === INICIALIZĀCIJA ===
updateDisplay();
timerStartBtn.addEventListener('click', startTimer);
timerPauseBtn.addEventListener('click', pauseTimer);
timerResetBtn.addEventListener('click', resetTimer);
timerModeToggle.addEventListener('click', toggleMode);
pomodoroSkipBtn.addEventListener('click', skipPomodoroPhase);