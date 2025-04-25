/**
 * Spiritual Quotes Website - Settings and Quote Navigation Manager
 * 
 * This file manages the settings panel and quote navigation functionality for the
 * spiritual quotes website. It provides the following features:
 * - Customizable quote display time (up to 15 minutes)
 * - Sequential or random quote navigation
 * - Keyboard navigation with arrow keys
 * - Optional visible timer display
 * - Settings panel accessible via gear icon
 * - Local storage of user preferences
 * 
 * The script dynamically adds navigation controls and settings UI to quote pages
 * without requiring modifications to individual quote HTML files.
 */

// Default settings
const defaultSettings = {
    quoteDisplayTime: 20, // seconds
    enableKeyboardNavigation: true,
    currentTheme: 'default', // for future dark mode
    randomQuotes: false, // Setting for random quote display
    showTimer: false // Setting to show/hide the countdown timer
};

// Global variables
let settings = {};
let currentQuoteIndex = 0;
let quoteTimer;
let countdownInterval;
let timeRemaining;
let settingsPanelOpen = false;

// Initialize settings
function initSettings() {
    // Load settings from localStorage or use defaults
    loadSettings();
    
    // Create settings panel
    createSettingsPanel();
    
    // Add settings button to navigation
    addSettingsButton();
    
    // Initialize quote navigation if we're on a quote page
    if (document.querySelector('.quote-container')) {
        initQuoteNavigation();
        
        // Apply current settings to the page
        applySettings();
    }
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('spiritualQuotesSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    } else {
        settings = { ...defaultSettings };
        saveSettings();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('spiritualQuotesSettings', JSON.stringify(settings));
}

// Create and append settings panel to the body
function createSettingsPanel() {
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'settings-panel';
    settingsPanel.innerHTML = `
        <div class="settings-header">
            <h3>Settings</h3>
            <button id="close-settings">×</button>
        </div>
        <div class="settings-content">
            <div class="setting-item">
                <label for="quote-display-time">Quote Display Time (seconds)</label>
                <input type="range" id="quote-display-time" min="5" max="900" step="5" value="${settings.quoteDisplayTime}">
                <span id="quote-time-value">${settings.quoteDisplayTime}</span>
            </div>
            <div class="setting-item">
                <label for="keyboard-nav">
                    <input type="checkbox" id="keyboard-nav" ${settings.enableKeyboardNavigation ? 'checked' : ''}>
                    Enable keyboard navigation (← →)
                </label>
            </div>
            <div class="setting-item">
                <label for="random-quotes">
                    <input type="checkbox" id="random-quotes" ${settings.randomQuotes ? 'checked' : ''}>
                    Display quotes randomly
                </label>
            </div>
            <div class="setting-item">
                <label for="show-timer">
                    <input type="checkbox" id="show-timer" ${settings.showTimer ? 'checked' : ''}>
                    Show meditation countdown timer
                </label>
            </div>
            <!-- Reserved for future dark mode setting -->
        </div>
    `;
    
    // Add styles for settings panel
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .settings-panel {
            position: fixed;
            top: 0;
            right: -300px; /* Start offscreen */
            width: 280px;
            height: 100%;
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: #f0f0f0;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            padding: 20px;
            transition: right 0.3s ease;
            overflow-y: auto;
            visibility: hidden; /* Hide until opened */
        }
        .settings-panel.open {
            right: 0;
            visibility: visible;
        }
        .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 10px;
        }
        .settings-header h3 {
            margin: 0;
        }
        #close-settings {
            background: none;
            border: none;
            color: #f0f0f0;
            font-size: 24px;
            cursor: pointer;
        }
        .setting-item {
            margin-bottom: 20px;
        }
        .setting-item label {
            display: block;
            margin-bottom: 8px;
        }
        .setting-item input[type="range"] {
            width: 80%;
            vertical-align: middle;
        }
        #quote-time-value {
            display: inline-block;
            margin-left: 10px;
        }
        
        /* Quote navigation buttons */
        .quote-nav-buttons {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
        .quote-nav-btn {
            background: rgba(255, 255, 255, 0.2);
            color: #f0f0f0;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 18px;
            margin: 0 10px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .quote-nav-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        /* Settings button */
        .settings-button-container {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
        }
        .settings-button {
            background: none;
            border: none;
            color: #bdc3c7;
            cursor: pointer;
            font-size: 16px;
            padding: 5px;
            transition: color 0.3s;
        }
        .settings-button:hover {
            color: #f0f0f0;
        }
        
        /* Timer display */
        .quote-timer {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.3);
            color: rgba(255, 255, 255, 0.7);
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 14px;
            opacity: 0.2;
            transition: opacity 0.3s;
            z-index: 100;
        }
        .quote-timer:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(styleElement);
    document.body.appendChild(settingsPanel);
    
    // Event listeners for settings panel
    document.getElementById('close-settings').addEventListener('click', toggleSettingsPanel);
    
    document.getElementById('quote-display-time').addEventListener('input', function() {
        const value = this.value;
        document.getElementById('quote-time-value').textContent = value;
        settings.quoteDisplayTime = parseInt(value);
        saveSettings();
        applySettings();
    });
    
    document.getElementById('keyboard-nav').addEventListener('change', function() {
        settings.enableKeyboardNavigation = this.checked;
        saveSettings();
        applySettings();
    });
    
    // Event listener for the random quotes setting
    document.getElementById('random-quotes').addEventListener('change', function() {
        settings.randomQuotes = this.checked;
        saveSettings();
        applySettings();
    });
    
    // Event listener for the show timer setting
    document.getElementById('show-timer').addEventListener('change', function() {
        settings.showTimer = this.checked;
        saveSettings();
        applySettings();
        
        if (settings.showTimer) {
            createOrUpdateTimerDisplay();
        } else {
            removeTimerDisplay();
        }
    });
}

// Create or update the timer display
function createOrUpdateTimerDisplay() {
    // Remove existing timer if present
    removeTimerDisplay();
    
    if (!settings.showTimer) return;
    
    // Create timer element
    const timerElement = document.createElement('div');
    timerElement.className = 'quote-timer';
    timerElement.id = 'quote-timer';
    document.body.appendChild(timerElement);
    
    // Initialize time remaining
    timeRemaining = settings.quoteDisplayTime;
    updateTimerDisplay();
    
    // Start countdown
    startCountdown();
}

// Remove the timer display
function removeTimerDisplay() {
    const existingTimer = document.getElementById('quote-timer');
    if (existingTimer) {
        existingTimer.remove();
    }
    
    // Clear countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Start the countdown timer
function startCountdown() {
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Set new interval
    countdownInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

// Update the timer display text
function updateTimerDisplay() {
    const timerElement = document.getElementById('quote-timer');
    if (!timerElement) return;
    
    // Format time as M:SS or MM:SS
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    timerElement.textContent = formattedTime;
}

// Reset the timer display
function resetTimerDisplay() {
    timeRemaining = settings.quoteDisplayTime;
    updateTimerDisplay();
    startCountdown();
}

// Add settings button to navigation
function addSettingsButton() {
    const navDiv = document.querySelector('.navigation');
    if (navDiv) {
        // Create a container for the settings button
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-button-container';
        
        // Create the button
        const settingsButton = document.createElement('button');
        settingsButton.className = 'settings-button';
        settingsButton.innerHTML = '⚙️';
        settingsButton.setAttribute('aria-label', 'Settings');
        settingsButton.addEventListener('click', toggleSettingsPanel);
        
        // Add button to container, then container to nav
        settingsContainer.appendChild(settingsButton);
        navDiv.appendChild(settingsContainer);
        
        // Make sure the nav has position relative for absolute positioning of the button
        navDiv.style.position = 'relative';
    }
}

// Toggle settings panel visibility
function toggleSettingsPanel() {
    const panel = document.querySelector('.settings-panel');
    if (panel) {
        settingsPanelOpen = !settingsPanelOpen;
        if (settingsPanelOpen) {
            panel.classList.add('open');
        } else {
            panel.classList.remove('open');
        }
    }
}

// Initialize quote navigation
function initQuoteNavigation() {
    // Create navigation buttons
    const quoteContainer = document.querySelector('.quote-container');
    if (!quoteContainer) return;
    
    const navButtons = document.createElement('div');
    navButtons.className = 'quote-nav-buttons';
    navButtons.innerHTML = `
        <button class="quote-nav-btn prev-quote">←</button>
        <button class="quote-nav-btn next-quote">→</button>
    `;
    quoteContainer.parentNode.insertBefore(navButtons, quoteContainer.nextSibling);
    
    // Store all quotes and find current quote
    if (typeof quotes !== 'undefined') {
        // Event listeners for quote navigation
        document.querySelector('.prev-quote').addEventListener('click', () => showPreviousQuote());
        document.querySelector('.next-quote').addEventListener('click', () => showNextQuote());
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!settings.enableKeyboardNavigation) return;
            
            if (e.key === 'ArrowLeft') {
                showPreviousQuote();
            } else if (e.key === 'ArrowRight') {
                showNextQuote();
            }
        });
        
        // Create timer display if setting is enabled
        if (settings.showTimer) {
            createOrUpdateTimerDisplay();
        }
    }
}

// Get random quote index that is different from current index
function getRandomQuoteIndex() {
    if (typeof quotes === 'undefined' || quotes.length <= 1) return 0;
    
    // If there's only one quote, return the same index
    if (quotes.length === 1) return 0;
    
    // Generate a random index that's different from the current one
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * quotes.length);
    } while (randomIndex === currentQuoteIndex);
    
    return randomIndex;
}

// Show previous quote
function showPreviousQuote() {
    if (typeof quotes === 'undefined') return;
    
    // Reset timer
    clearTimeout(quoteTimer);
    
    if (settings.randomQuotes) {
        // In random mode, just show another random quote
        currentQuoteIndex = getRandomQuoteIndex();
    } else {
        // Get previous index sequentially
        currentQuoteIndex = (currentQuoteIndex > 0) ? currentQuoteIndex - 1 : quotes.length - 1;
    }
    
    // Display the quote
    displaySelectedQuote();
}

// Show next quote
function showNextQuote() {
    if (typeof quotes === 'undefined') return;
    
    // Reset timer
    clearTimeout(quoteTimer);
    
    if (settings.randomQuotes) {
        // In random mode, get a random quote index
        currentQuoteIndex = getRandomQuoteIndex();
    } else {
        // Get next index sequentially
        currentQuoteIndex = (currentQuoteIndex < quotes.length - 1) ? currentQuoteIndex + 1 : 0;
    }
    
    // Display the quote
    displaySelectedQuote();
}

// Display selected quote
function displaySelectedQuote() {
    const quoteElement = document.getElementById('quote');
    const authorElement = document.getElementById('author');
    
    if (!quoteElement || !authorElement) return;
    
    // Fade out
    quoteElement.style.opacity = '0';
    authorElement.style.opacity = '0';
    
    // Change content and fade in
    setTimeout(() => {
        quoteElement.textContent = quotes[currentQuoteIndex].text;
        authorElement.textContent = `- ${quotes[currentQuoteIndex].author}`;
        quoteElement.style.opacity = '1';
        authorElement.style.opacity = '1';
        
        // Reset timer display
        if (settings.showTimer) {
            resetTimerDisplay();
        }
        
        // Set timer for next quote
        quoteTimer = setTimeout(() => showNextQuote(), settings.quoteDisplayTime * 1000);
    }, 1000);
}

// Apply current settings to the page
function applySettings() {
    // If we're on a quote page and have a timer running
    if (typeof quotes !== 'undefined' && quoteTimer) {
        // Clear existing timer
        clearTimeout(quoteTimer);
        
        // Set new timer
        quoteTimer = setTimeout(() => showNextQuote(), settings.quoteDisplayTime * 1000);
        
        // Update timer display if enabled
        if (settings.showTimer) {
            resetTimerDisplay();
        }
    }
}

// Override the original displayQuote function if it exists
window.addEventListener('load', () => {
    // Override default displayQuote function if it exists
    if (typeof window.displayQuote === 'function') {
        // Store the original function
        const originalDisplayQuote = window.displayQuote;
        
        // Override with our own implementation
        window.displayQuote = function() {
            // If random mode is enabled, use a random index
            if (settings.randomQuotes) {
                currentQuoteIndex = getRandomQuoteIndex();
            }
            
            const quoteElement = document.getElementById('quote');
            const authorElement = document.getElementById('author');
            
            if (!quoteElement || !authorElement) return;
            
            quoteElement.style.opacity = '0';
            authorElement.style.opacity = '0';
            
            setTimeout(() => {
                quoteElement.textContent = quotes[currentQuoteIndex].text;
                authorElement.textContent = `- ${quotes[currentQuoteIndex].author}`;
                quoteElement.style.opacity = '1';
                authorElement.style.opacity = '1';
            }, 1000);
            
            // Reset timer display if enabled
            if (settings.showTimer) {
                resetTimerDisplay();
            }
            
            // Use settings for delay
            quoteTimer = setTimeout(() => showNextQuote(), settings.quoteDisplayTime * 1000);
        };
    }
    
    // Initialize settings
    initSettings();
}); 