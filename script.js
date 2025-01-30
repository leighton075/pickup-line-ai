document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (message) {
        addMessage('user-message', message);
        input.value = '';
        showLoading();

        try {
            const botResponse = await getDeepSeekResponse(message);
            addMessage('bot-message', botResponse);
        } catch (error) {
            console.error('Error fetching response from DeepSeek API:', error);
            addMessage('bot-message', 'Oops! Something went wrong. Please try again.');
        } finally {
            hideLoading();
        }
    }
}

async function getDeepSeekResponse(userMessage) {
    const response = await fetch('https://your-netlify-site.netlify.app/.netlify/functions/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
        throw new Error('API error');
    }

    const data = await response.json();
    return data.response;
}

function showLoading() {
    const chatMessages = document.getElementById('chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.innerHTML = '<p>Typing <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></p>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function addMessage(className, text) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
