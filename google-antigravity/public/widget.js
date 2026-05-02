(function() {
  const SCRIPT_URL = document.currentScript.src;
  const BASE_URL = new URL(SCRIPT_URL).origin;
  const CHATBOT_ID = document.currentScript.getAttribute('data-chatbot-id');

  if (!CHATBOT_ID) {
    console.error('SmartDocs: Missing data-chatbot-id attribute on script tag.');
    return;
  }

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #smartdocs-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #smartdocs-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: var(--sd-accent, #4f46e5);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s;
    }
    #smartdocs-bubble:hover {
      transform: scale(1.05);
    }
    #smartdocs-bubble.pulse {
      animation: sd-pulse 2s infinite;
    }
    @keyframes sd-pulse {
      0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }
    #smartdocs-window {
      position: absolute;
      bottom: 76px;
      right: 0;
      width: 320px;
      height: 480px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    @media (max-width: 640px) {
      #smartdocs-window {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
      }
    }
    #smartdocs-header {
      background: var(--sd-accent, #4f46e5);
      color: white;
      padding: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #smartdocs-close {
      cursor: pointer;
      background: none;
      border: none;
      color: white;
      font-size: 20px;
    }
    #smartdocs-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sd-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
    }
    .sd-user {
      align-self: flex-end;
      background: #e5e7eb;
      color: #111827;
      border-bottom-right-radius: 4px;
    }
    .sd-bot {
      align-self: flex-start;
      background: white;
      color: #111827;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
    }
    #smartdocs-input-area {
      padding: 12px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }
    #smartdocs-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    #smartdocs-input:focus {
      border-color: var(--sd-accent, #4f46e5);
    }
    #smartdocs-send {
      background: var(--sd-accent, #4f46e5);
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #smartdocs-branding {
      text-align: center;
      padding: 4px 0 8px;
      font-size: 11px;
      color: #9ca3af;
      background: white;
    }
    #smartdocs-branding a {
      color: #6b7280;
      text-decoration: none;
    }
    #smartdocs-branding a:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  // Get or create session ID
  let sessionId = localStorage.getItem('smartdocs_session');
  if (!sessionId) {
    sessionId = 'sd_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('smartdocs_session', sessionId);
  }

  // Create DOM
  const container = document.createElement('div');
  container.id = 'smartdocs-widget-container';
  
  container.innerHTML = `
    <div id="smartdocs-window">
      <div id="smartdocs-header">
        <span>SmartDocs AI</span>
        <button id="smartdocs-close">&times;</button>
      </div>
      <div id="smartdocs-messages">
        <div class="sd-message sd-bot">Hi! How can I help you today?</div>
      </div>
      <div id="smartdocs-input-area">
        <input type="text" id="smartdocs-input" placeholder="Ask me anything..." autocomplete="off" />
        <button id="smartdocs-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
      <div id="smartdocs-branding">
        Powered by <a href="${BASE_URL}" target="_blank">SmartDocs</a>
      </div>
    </div>
    <div id="smartdocs-bubble" class="pulse">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
    </div>
  `;
  
  document.body.appendChild(container);

  const bubble = document.getElementById('smartdocs-bubble');
  const chatWindow = document.getElementById('smartdocs-window');
  const closeBtn = document.getElementById('smartdocs-close');
  const input = document.getElementById('smartdocs-input');
  const sendBtn = document.getElementById('smartdocs-send');
  const messagesDiv = document.getElementById('smartdocs-messages');

  let isOpen = false;

  bubble.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    bubble.classList.remove('pulse');
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chatWindow.style.display = 'none';
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'sd-message sd-user';
    userMsg.textContent = text;
    messagesDiv.appendChild(userMsg);
    
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Add bot placeholder
    const botMsg = document.createElement('div');
    botMsg.className = 'sd-message sd-bot';
    botMsg.innerHTML = '<span class="sd-typing">...</span>';
    messagesDiv.appendChild(botMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId: CHATBOT_ID, message: text, sessionId })
      });

      if (!response.ok) {
        botMsg.textContent = "Sorry, I'm having trouble connecting right now.";
        return;
      }

      botMsg.textContent = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botMsg.textContent += decoder.decode(value);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    } catch (err) {
      botMsg.textContent = "An error occurred while sending your message.";
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

})();
