// Main Game UI Controller

let stampPosition = { x: window.innerWidth - 200, y: 100 };
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Initialize game on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    setupStampDrag();
    game.startGame();
    updateGameUI();
});

function initializeGame() {
    // Initial UI update
    updateConversationList();
    updateMessages();
    updateResponseButtons();
    updateTimer();
}

function setupEventListeners() {
    // Reset button
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the game?')) {
                game.resetGame();
                updateGameUI();
            }
        });
    }

    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const filter = this.textContent.trim();
            game.filterConversations(filter);
            updateConversationList();
        });
    });

    // Search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            game.searchConversations(e.target.value);
            updateConversationList();
        });
    }

    // Restart button in results screen
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            game.resetGame();
            game.startGame();
            updateGameUI();
            hideResultsScreen();
        });
    }
}

function setupStampDrag() {
    const stampHandle = document.querySelector('.stamp-handle');
    const stampContainer = document.getElementById('stampContainer');
    
    if (!stampHandle || !stampContainer) return;

    // Set initial position
    stampContainer.style.left = stampPosition.x + 'px';
    stampContainer.style.top = stampPosition.y + 'px';

    stampHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = stampContainer.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            stampPosition.x = e.clientX - dragOffset.x;
            stampPosition.y = e.clientY - dragOffset.y;
            
            // Keep within bounds
            stampPosition.x = Math.max(0, Math.min(stampPosition.x, window.innerWidth - 150));
            stampPosition.y = Math.max(0, Math.min(stampPosition.y, window.innerHeight - 100));
            
            stampContainer.style.left = stampPosition.x + 'px';
            stampContainer.style.top = stampPosition.y + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Stamp option buttons
    const stampOptions = document.querySelectorAll('.stamp-option');
    stampOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const stampType = option.dataset.stamp;
            if (game.activeConversationId !== null) {
                const isCorrect = game.stampConversation(game.activeConversationId, stampType);
                updateGameUI();
                
                // Visual feedback
                if (isCorrect !== null) {
                    showStampFeedback(isCorrect);
                }
            }
        });
    });
}

function updateGameUI() {
    updateConversationList();
    updateMessages();
    updateResponseButtons();
    updateChatHeader();
}

function updateConversationList() {
    const container = document.getElementById('conversationList');
    if (!container) return;

    game.applyFilters();
    const conversations = game.filteredConversations.length > 0 ? game.filteredConversations : game.conversations;

    container.innerHTML = '';

    conversations.forEach(conversation => {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        if (conversation.id === game.activeConversationId) {
            item.classList.add('active');
        }
        if (!conversation.isRead) {
            item.classList.add('unread');
        }
        if (conversation.hasEnded) {
            item.classList.add('ended');
        }

        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const previewText = lastMessage ? (lastMessage.text.length > 40 ? lastMessage.text.substring(0, 40) + '...' : lastMessage.text) : '';
        const senderName = lastMessage && lastMessage.isUser ? 'You: ' : (lastMessage ? conversation.name + ': ' : '');

        // Format date
        const date = lastMessage ? formatMessageDate(lastMessage.timestamp) : '';

        item.innerHTML = `
            <div class="profile-avatar" style="position: relative;">
                <div class="avatar-placeholder" style="background: ${conversation.avatarColor}"></div>
                ${conversation.isOnline ? '<span class="status-dot"></span>' : ''}
                ${conversation.isTyping ? '<span class="status-dot" style="animation: pulse 1s infinite;"></span>' : ''}
                ${conversation.isStamped ? `<span class="stamp-imprint ${conversation.stampType}">${conversation.stampType.toUpperCase()}</span>` : ''}
            </div>
            <div class="conversation-content">
                <div class="conversation-header">
                    <span class="contact-name">${conversation.name}</span>
                    <span class="message-date">${date}</span>
                </div>
                <div class="message-preview">
                    ${senderName ? `<span class="sender-name">${senderName}</span>` : ''}
                    <span class="preview-text">${previewText}</span>
                </div>
            </div>
            ${!conversation.isRead ? '<div class="unread-badge"></div>' : ''}
        `;

        item.dataset.conversationId = conversation.id;
        
        item.addEventListener('click', () => {
            game.activeConversationId = conversation.id;
            conversation.isRead = true;
            updateGameUI();
        });

        container.appendChild(item);
    });
}

function updateMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container || game.activeConversationId === null) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: #666;">Select a conversation to view messages</div>';
        return;
    }

    const conversation = game.conversations.find(c => c.id === game.activeConversationId);
    if (!conversation) return;

    container.innerHTML = '';

    conversation.messages.forEach((message, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isUser ? 'user-message' : 'contact-message'}`;

        const time = formatMessageTime(message.timestamp);

        if (message.isUser) {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-placeholder small" style="background: linear-gradient(135deg, #0077b5 0%, #005885 100%);"></div>
                    <span class="checkmark">✓</span>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">You</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-bubble user-bubble">
                        <p>${escapeHtml(message.text)}</p>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-placeholder small" style="background: ${conversation.avatarColor}"></div>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">${conversation.name}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-bubble contact-bubble">
                        <p>${escapeHtml(message.text)}</p>
                    </div>
                </div>
            `;
        }

        container.appendChild(messageDiv);
    });

    // Show typing indicator if active
    if (conversation.isTyping) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message contact-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-placeholder small" style="background: ${conversation.avatarColor}"></div>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span>${conversation.name} is typing</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(typingDiv);
    }

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function updateResponseButtons() {
    const container = document.getElementById('responseButtonsContainer');
    const inputWrapper = document.getElementById('messageInputWrapper');
    
    if (!container) return;

    if (game.activeConversationId === null) {
        container.innerHTML = '';
        if (inputWrapper) inputWrapper.style.display = 'none';
        return;
    }

    const conversation = game.conversations.find(c => c.id === game.activeConversationId);
    if (!conversation || conversation.hasEnded) {
        container.innerHTML = '<div style="padding: 12px; color: #666; font-style: italic;">This conversation has ended.</div>';
        if (inputWrapper) inputWrapper.style.display = 'none';
        return;
    }

    const options = game.generateResponseOptions(conversation);
    container.innerHTML = '';

    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'response-button';
        button.textContent = option;
        button.addEventListener('click', () => {
            game.sendMessage(conversation.id, option);
            updateGameUI();
        });
        container.appendChild(button);
    });

    if (inputWrapper) inputWrapper.style.display = 'none';
}

function updateChatHeader() {
    if (game.activeConversationId === null) {
        const chatHeader = document.querySelector('.chat-header-info');
        if (chatHeader) {
            chatHeader.querySelector('.chat-contact-name').textContent = 'Select a conversation';
            chatHeader.querySelector('.active-status').textContent = '';
        }
        return;
    }

    const conversation = game.conversations.find(c => c.id === game.activeConversationId);
    if (!conversation) return;

    const chatHeader = document.querySelector('.chat-header-info');
    const chatAvatar = document.querySelector('.chat-profile-avatar');
    if (chatHeader) {
        chatHeader.querySelector('.chat-contact-name').textContent = conversation.name;
        const statusEl = chatHeader.querySelector('.active-status');
        if (conversation.isTyping) {
            statusEl.textContent = 'typing...';
        } else if (conversation.hasEnded) {
            statusEl.textContent = 'Conversation ended';
        } else if (conversation.isOnline) {
            statusEl.textContent = 'Active now';
        } else {
            statusEl.textContent = '';
        }
    }
    if (chatAvatar) {
        const avatarPlaceholder = chatAvatar.querySelector('.avatar-placeholder');
        if (avatarPlaceholder) {
            avatarPlaceholder.style.background = conversation.avatarColor;
        }
        // Update online status dot
        let statusDot = chatAvatar.querySelector('.status-dot');
        if (conversation.isOnline && !conversation.isTyping) {
            if (!statusDot) {
                statusDot = document.createElement('span');
                statusDot.className = 'status-dot';
                chatAvatar.appendChild(statusDot);
            }
        } else if (statusDot && !conversation.isTyping) {
            statusDot.remove();
        }
    }
}

function updateTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    const timerProgress = document.getElementById('timerProgress');
    
    if (timerDisplay) {
        timerDisplay.textContent = game.formatTime(game.gameState.timeRemaining);
    }
    
    if (timerProgress) {
        const percentage = (game.gameState.timeRemaining / 30) * 100;
        timerProgress.style.width = percentage + '%';
        
        if (game.gameState.timeRemaining <= 10) {
            timerProgress.classList.add('warning');
        } else {
            timerProgress.classList.remove('warning');
        }
    }
}

// Global function for game to call
window.updateTimer = updateTimer;
window.updateGameUI = updateGameUI;
window.resetGameUI = function() {
    updateGameUI();
    updateTimer();
    stampPosition = { x: window.innerWidth - 200, y: 100 };
    const stampContainer = document.getElementById('stampContainer');
    if (stampContainer) {
        stampContainer.style.left = stampPosition.x + 'px';
        stampContainer.style.top = stampPosition.y + 'px';
    }
};

function showResultsScreen(won) {
    const overlay = document.getElementById('resultsOverlay');
    const title = document.getElementById('resultsTitle');
    const statTime = document.getElementById('statTime');
    const statCorrect = document.getElementById('statCorrect');
    const statIncorrect = document.getElementById('statIncorrect');
    const statAccuracy = document.getElementById('statAccuracy');
    const statResult = document.getElementById('statResult');

    if (!overlay) return;

    const totalGuesses = game.gameState.correctGuesses + game.gameState.incorrectGuesses;
    const accuracy = totalGuesses > 0 ? Math.round((game.gameState.correctGuesses / totalGuesses) * 100) : 0;
    const timeTaken = game.gameState.startTime ? Math.floor((Date.now() - game.gameState.startTime) / 1000) : 0;

    if (title) {
        title.textContent = won ? 'You Found the Real Recruiter!' : 'Time\'s Up!';
        title.className = `results-title ${won ? 'won' : 'lost'}`;
    }

    if (statTime) statTime.textContent = game.formatTime(timeTaken);
    if (statCorrect) statCorrect.textContent = game.gameState.correctGuesses;
    if (statIncorrect) statIncorrect.textContent = game.gameState.incorrectGuesses;
    if (statAccuracy) statAccuracy.textContent = accuracy + '%';
    if (statResult) statResult.textContent = won ? 'WIN' : 'LOSE';

    overlay.classList.add('show');
}

function hideResultsScreen() {
    const overlay = document.getElementById('resultsOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

window.showResultsScreen = showResultsScreen;

// Function to add new message with push animation
window.addNewMessageWithAnimation = function(conversationId) {
    const conversation = game.conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    // Find the conversation item in the list
    const conversationList = document.getElementById('conversationList');
    if (!conversationList) return;
    
    const items = conversationList.querySelectorAll('.conversation-item');
    let targetItem = null;
    
    items.forEach((item, index) => {
        if (item.dataset.conversationId == conversationId) {
            targetItem = item;
        }
    });
    
    if (targetItem) {
        // Add animation class
        targetItem.classList.add('new-message-push');
        
        // Create a temporary highlight
        const highlight = document.createElement('div');
        highlight.className = 'new-message-highlight';
        highlight.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 119, 181, 0.1);
            border-left: 3px solid #0077b5;
            pointer-events: none;
            animation: highlightFade 2s forwards;
        `;
        targetItem.style.position = 'relative';
        targetItem.appendChild(highlight);
        
        // Remove highlight after animation
        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
            targetItem.classList.remove('new-message-push');
        }, 2000);
        
        // Scroll item into view if needed
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Update the conversation list to show new message
    updateConversationList();
};

function showStampFeedback(isCorrect) {
    // Visual feedback for stamp action
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px 40px;
        background-color: ${isCorrect ? '#00a660' : '#ff6b6b'};
        color: white;
        border-radius: 8px;
        font-weight: 700;
        font-size: 18px;
        z-index: 3000;
        pointer-events: none;
        animation: fadeOut 1s forwards;
    `;
    feedback.textContent = isCorrect ? '+15s ✓' : '-10s ✗';
    document.body.appendChild(feedback);

    setTimeout(() => {
        if (document.body.contains(feedback)) {
            document.body.removeChild(feedback);
        }
    }, 1000);
}


// Add fadeOut animation and push animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    @keyframes highlightFade {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
    @keyframes pushDown {
        0% { transform: translateY(-10px); opacity: 0.8; }
        100% { transform: translateY(0); opacity: 1; }
    }
    .new-message-push {
        animation: pushDown 0.5s ease-out;
    }
`;
document.head.appendChild(style);

function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function formatMessageDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Show actual dates more often instead of "Today"
    if (diffDays === 0) {
        // Sometimes show "Today", sometimes show time
        if (Math.random() > 0.3) {
            return 'Today';
        }
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
