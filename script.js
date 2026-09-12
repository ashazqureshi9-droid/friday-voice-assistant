/* ========================================
   FRIDAY - JavaScript Functionality
   ======================================== */

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

// DOM Elements
const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const listenBtn = document.getElementById('listenBtn');
const sendBtn = document.getElementById('sendBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// Quick Action Buttons
const quickBtns = document.querySelectorAll('.quick-btn');

// Modals
const patternModal = document.getElementById('patternModal');
const piModal = document.getElementById('piModal');
const decideModal = document.getElementById('decideModal');

let isListening = false;
let conversationHistory = [];

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkServerStatus();
    removeWelcomeMessage();
});

function setupEventListeners() {
    listenBtn.addEventListener('click', startListening);
    sendBtn.addEventListener('click', sendMessage);
    stopBtn.addEventListener('click', stopListening);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Quick Action Buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleQuickAction(action);
        });
    });

    // Modal Close Buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('show');
        });
    });

    // Pattern Finder Modal
    document.getElementById('analyzePatternBtn').addEventListener('click', analyzePattern);
    document.getElementById('patternInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') analyzePattern();
    });

    // Pi Calculator Modal
    document.getElementById('calculatePiBtn').addEventListener('click', calculatePi);
    document.getElementById('piDigits').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculatePi();
    });

    // Decision Helper Modal
    document.getElementById('nextStep1Btn').addEventListener('click', goToStep2);
    document.getElementById('nextStep2Btn').addEventListener('click', goToStep3);
    document.getElementById('calculateDecisionBtn').addEventListener('click', calculateDecision);

    // Speech Recognition Events
    recognition.onstart = () => {
        isListening = true;
        listenBtn.disabled = true;
        stopBtn.disabled = false;
        listenBtn.textContent = '🎤 Listening...';
        addSystemMessage('Listening...');
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        userInput.value = transcript;
        addUserMessage(transcript);
        handleCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        addSystemMessage(`Error: ${event.error}`);
        stopListening();
    };

    recognition.onend = () => {
        isListening = false;
        listenBtn.disabled = false;
        stopBtn.disabled = true;
        listenBtn.textContent = '🎤 Start Listening';
    };
}

// ========================================
// LISTENING & INPUT
// ========================================

function startListening() {
    userInput.value = '';
    recognition.start();
}

function stopListening() {
    recognition.stop();
    isListening = false;
}

function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    userInput.value = '';
    addUserMessage(message);
    handleCommand(message);
}

// ========================================
// CHAT DISPLAY
// ========================================

function removeWelcomeMessage() {
    const welcome = document.querySelector('.welcome-message');
    if (welcome) welcome.remove();
}

function addUserMessage(text) {
    removeWelcomeMessage();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(text)}</div>
        <div class="message-time">${getTime()}</div>
    `;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addAssistantMessage(text) {
    removeWelcomeMessage();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(text)}</div>
        <div class="message-time">${getTime()}</div>
    `;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.style.cssText = 'justify-content: center; color: #999; font-size: 0.9em;';
    messageDiv.innerHTML = `<div style="color: #666;">${text}</div>`;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// COMMAND HANDLING
// ========================================

function handleCommand(command) {
    const lower = command.toLowerCase();

    if (lower.includes('shut down') || lower.includes('stop listening') || lower.includes('goodbye')) {
        addAssistantMessage('Goodbye! See you next time.');
        return;
    }

    if (lower.includes('help me decide') || lower.includes('compare') || lower.includes('which is better')) {
        handleQuickAction('decide');
        return;
    }

    if ((lower.includes('pattern') || lower.includes('sequence')) && lower.includes('number')) {
        handleQuickAction('pattern');
        return;
    }

    if (lower.includes('pi') && (lower.includes('digit') || lower.includes('decimal') || lower.includes('value'))) {
        handleQuickAction('pi');
        return;
    }

    askAI(command);
}

function handleQuickAction(action) {
    switch (action) {
        case 'pattern':
            openModal(patternModal);
            break;
        case 'pi':
            openModal(piModal);
            break;
        case 'decide':
            openModal(decideModal);
            resetDecideModal();
            break;
    }
}

// ========================================
// PATTERN FINDER
// ========================================

function analyzePattern() {
    const input = document.getElementById('patternInput').value.trim();
    const numbers = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

    if (numbers.length < 3) {
        showResult('patternResult', 'Please enter at least 3 numbers.');
        return;
    }

    const { next, description } = findPattern(numbers);
    const result = next !== null 
        ? `${description} The next number should be: <strong>${next}</strong>`
        : description;
    
    showResult('patternResult', result);
    addAssistantMessage(result);
}

function findPattern(nums) {
    // Check arithmetic progression
    const diffs = [];
    for (let i = 1; i < nums.length; i++) {
        diffs.push(nums[i] - nums[i - 1]);
    }
    
    if (diffs.every(d => Math.abs(d - diffs[0]) < 1e-6)) {
        const next = nums[nums.length - 1] + diffs[0];
        return { 
            next: formatNumber(next), 
            description: `Arithmetic pattern (difference: ${formatNumber(diffs[0])})` 
        };
    }

    // Check geometric progression
    if (nums.every(n => n !== 0)) {
        const ratios = [];
        for (let i = 1; i < nums.length; i++) {
            ratios.push(nums[i] / nums[i - 1]);
        }
        if (ratios.every(r => Math.abs(r - ratios[0]) < 1e-6)) {
            const next = nums[nums.length - 1] * ratios[0];
            return { 
                next: formatNumber(next), 
                description: `Geometric pattern (ratio: ${formatNumber(ratios[0])})` 
            };
        }
    }

    // Check Fibonacci-like
    if (nums.length >= 3) {
        let isFibonacci = true;
        for (let i = 2; i < nums.length; i++) {
            if (Math.abs(nums[i] - (nums[i - 1] + nums[i - 2])) > 1e-6) {
                isFibonacci = false;
                break;
            }
        }
        if (isFibonacci) {
            const next = nums[nums.length - 1] + nums[nums.length - 2];
            return { 
                next: formatNumber(next), 
                description: 'Fibonacci-style pattern (each term is sum of previous two)' 
            };
        }
    }

    return { next: null, description: 'No simple pattern found in this sequence.' };
}

// ========================================
// PI CALCULATOR
// ========================================

function calculatePi() {
    const digits = parseInt(document.getElementById('piDigits').value) || 20;
    const validDigits = Math.max(1, Math.min(digits, 500));
    
    const piValue = computePi(validDigits);
    const result = `π to ${validDigits} decimal places:<br/><strong>${piValue}</strong>`;
    
    showResult('piResult', result);
    addAssistantMessage(`Pi to ${validDigits} decimal places is ${piValue}`);
}

function computePi(digits) {
    // Bailey–Borwein–Plouffe formula approximation
    let pi = 0;
    for (let k = 0; k < digits; k++) {
        const ak = Math.pow(16, -k);
        const sum = (4 / (8 * k + 1)) - (2 / (8 * k + 4)) - (1 / (8 * k + 5)) - (1 / (8 * k + 6));
        pi += ak * sum;
    }
    return pi.toFixed(digits);
}

// ========================================
// DECISION HELPER
// ========================================

function resetDecideModal() {
    document.getElementById('decideStep1').style.display = 'block';
    document.getElementById('decideStep2').style.display = 'none';
    document.getElementById('decideStep3').style.display = 'none';
    document.getElementById('decideResult').style.display = 'none';
    document.getElementById('decideResult').innerHTML = '';
    document.getElementById('optionsInput').value = '';
    document.getElementById('criteriaInput').value = '';
    document.getElementById('ratingContainer').innerHTML = '';
}

function goToStep2() {
    const options = document.getElementById('optionsInput').value
        .split(',')
        .map(o => o.trim())
        .filter(o => o);

    if (options.length < 2) {
        alert('Please enter at least 2 options.');
        return;
    }

    window.decideOptions = options;
    document.getElementById('decideStep1').style.display = 'none';
    document.getElementById('decideStep2').style.display = 'block';
}

function goToStep3() {
    const criteria = document.getElementById('criteriaInput').value
        .split(',')
        .map(c => c.trim())
        .filter(c => c);

    if (criteria.length < 1) {
        alert('Please enter at least 1 factor.');
        return;
    }

    window.decideCriteria = criteria;
    window.decideWeights = {};

    const container = document.getElementById('ratingContainer');
    container.innerHTML = '';

    criteria.forEach(criterion => {
        const div = document.createElement('div');
        div.className = 'rating-item';
        div.innerHTML = `
            <label>${criterion} (importance 1-10)</label>
            <input type="range" min="1" max="10" value="5" class="weight-input" data-criterion="${criterion}">
            <span class="weight-value">5</span>
        `;
        container.appendChild(div);

        const input = div.querySelector('.weight-input');
        const span = div.querySelector('.weight-value');
        input.addEventListener('input', (e) => {
            span.textContent = e.target.value;
            window.decideWeights[criterion] = parseInt(e.target.value);
        });
        window.decideWeights[criterion] = 5;
    });

    // Add option ratings
    window.decideOptions.forEach(option => {
        const heading = document.createElement('h4');
        heading.style.cssText = 'color: #00d4ff; margin-top: 20px; margin-bottom: 10px;';
        heading.textContent = `Rate "${option}"`;
        container.appendChild(heading);

        window.decideCriteria.forEach(criterion => {
            const div = document.createElement('div');
            div.className = 'rating-item';
            div.innerHTML = `
                <label>${option} on ${criterion} (1-10)</label>
                <input type="range" min="1" max="10" value="5" class="score-input" data-option="${option}" data-criterion="${criterion}">
                <span class="score-value">5</span>
            `;
            container.appendChild(div);

            const input = div.querySelector('.score-input');
            const span = div.querySelector('.score-value');
            input.addEventListener('input', (e) => {
                span.textContent = e.target.value;
            });
        });
    });

    document.getElementById('decideStep2').style.display = 'none';
    document.getElementById('decideStep3').style.display = 'block';
}

function calculateDecision() {
    const scores = {};

    window.decideOptions.forEach(option => {
        scores[option] = 0;
        window.decideCriteria.forEach(criterion => {
            const input = document.querySelector(
                `.score-input[data-option="${option}"][data-criterion="${criterion}"]`
            );
            const rating = parseInt(input.value);
            const weight = window.decideWeights[criterion];
            scores[option] += rating * weight;
        });
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0];

    let resultHtml = `<h3>🏆 Winner: ${winner[0]}</h3>`;
    resultHtml += '<p style="margin: 15px 0;">Scores:</p><ul style="color: #aaa;">';
    sorted.forEach(([option, score]) => {
        resultHtml += `<li>${option}: ${score.toFixed(0)} points</li>`;
    });
    resultHtml += '</ul>';

    showResult('decideResult', resultHtml);
    addAssistantMessage(`Based on your ratings, ${winner[0]} comes out on top with a score of ${winner[1].toFixed(0)} points.`);
}

// ========================================
// MODAL HELPERS
// ========================================

function openModal(modal) {
    modal.classList.add('show');
}

function closeModal(modal) {
    modal.classList.remove('show');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

function showResult(elementId, html) {
    const element = document.getElementById(elementId);
    element.innerHTML = html;
    element.classList.add('show');
}

// ========================================
// AI BRAIN (LOCAL)
// ========================================

async function askAI(prompt) {
    addSystemMessage('Thinking...');

    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
        });

        if (!response.ok) {
            throw new Error('Server error');
        }

        const data = await response.json();
        addAssistantMessage(data.response);
    } catch (error) {
        console.error('Error:', error);
        addAssistantMessage(
            'I cannot connect to the AI brain right now. Make sure the Python server is running (python server.py).'
        );
    }
}

// ========================================
// SERVER STATUS
// ========================================

async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
            statusDot.classList.add('active');
            statusText.textContent = 'Online';
        }
    } catch (error) {
        statusDot.classList.remove('active');
        statusText.textContent = 'Offline';
    }
}

// Check status every 5 seconds
setInterval(checkServerStatus, 5000);

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatNumber(n) {
    return Number.isInteger(n) ? n.toString() : n.toFixed(4);
}
