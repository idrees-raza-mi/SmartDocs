(function() {
  const SCRIPT_URL = document.currentScript.src;
  const BASE_URL = new URL(SCRIPT_URL).origin;
  const CHATBOT_ID = document.currentScript.getAttribute('data-chatbot-id');

  if (!CHATBOT_ID) {
    console.error('DocWise: Missing data-chatbot-id attribute on script tag.');
    return;
  }

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #dw-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #dw-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: var(--dw-accent, #ffffff);
      color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(255, 255, 255, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #dw-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 32px rgba(255, 255, 255, 0.25);
    }
    #dw-bubble.pulse {
      animation: dw-pulse 2.5s infinite;
    }
    @keyframes dw-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
      70%  { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }
    #dw-window {
      position: absolute;
      bottom: 72px;
      right: 0;
      width: 340px;
      height: 500px;
      background: #0f0f0f;
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    @media (max-width: 640px) {
      #dw-window {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
      }
    }
    #dw-header {
      background: #111111;
      color: white;
      padding: 14px 16px;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      letter-spacing: -0.02em;
    }
    #dw-header-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #dw-close {
      cursor: pointer;
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      font-size: 18px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    #dw-close:hover { background: rgba(255,255,255,0.25); }
    #dw-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #0a0a0a;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    #dw-messages::-webkit-scrollbar { width: 4px; }
    #dw-messages::-webkit-scrollbar-track { background: transparent; }
    #dw-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .dw-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
    }
    .dw-user {
      align-self: flex-end;
      background: #ffffff;
      color: #000000;
      border-bottom-right-radius: 4px;
    }
    .dw-bot {
      align-self: flex-start;
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.9);
      border: 1px solid rgba(255,255,255,0.08);
      border-bottom-left-radius: 4px;
    }
    #dw-input-area {
      padding: 12px;
      background: #0f0f0f;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    #dw-input {
      flex: 1;
      padding: 9px 14px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      outline: none;
      font-size: 14px;
      background: rgba(255,255,255,0.04);
      color: white;
      transition: border-color 0.15s;
    }
    #dw-input::placeholder { color: rgba(255,255,255,0.25); }
    #dw-input:focus { border-color: #ffffff; }
    #dw-send {
      background: #ffffff;
      color: #000000;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, transform 0.1s;
      flex-shrink: 0;
    }
    #dw-send:hover { background: #e5e5e5; transform: scale(1.05); }
    #dw-branding {
      text-align: center;
      padding: 4px 0 8px;
      font-size: 11px;
      color: rgba(255,255,255,0.2);
      background: #0f0f0f;
    }
    #dw-branding a {
      color: rgba(255,255,255,0.3);
      text-decoration: none;
    }
    #dw-branding a:hover { color: rgba(255,255,255,0.6); }
  `;
  document.head.appendChild(style);

  // Get or create session ID
  let sessionId = localStorage.getItem('docwise_session');
  if (!sessionId) {
    sessionId = 'dw_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('docwise_session', sessionId);
  }

  // Create DOM
  const container = document.createElement('div');
  container.id = 'dw-widget-container';
  
  container.innerHTML = `
    <div id="dw-window">
      <div id="dw-header">
        <div id="dw-header-logo">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.2)"/>
            <path d="M10 32 L16 18 L22 28 L24 24 L26 28 L32 18 L38 32" stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
          <span>DocWise AI</span>
        </div>
        <button id="dw-close">&times;</button>
      </div>
      <div id="dw-messages">
        <div class="dw-message dw-bot">Hi! I'm trained on the full documentation. How can I help?</div>
      </div>
      <div id="dw-input-area">
        <input type="text" id="dw-input" placeholder="Ask me anything..." autocomplete="off" />
        <button id="dw-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
      <div id="dw-branding">
        Powered by <a href="${BASE_URL}" target="_blank">DocWise</a>
      </div>
    </div>
    <div id="dw-bubble" class="pulse">
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 32 L16 18 L22 28 L24 24 L26 28 L32 18 L38 32" stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </div>
  `;
  
  document.body.appendChild(container);

  const bubble = document.getElementById('dw-bubble');
  const chatWindow = document.getElementById('dw-window');
  const closeBtn = document.getElementById('dw-close');
  const input = document.getElementById('dw-input');
  const sendBtn = document.getElementById('dw-send');
  const messagesDiv = document.getElementById('dw-messages');

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

    const userMsg = document.createElement('div');
    userMsg.className = 'dw-message dw-user';
    userMsg.textContent = text;
    messagesDiv.appendChild(userMsg);
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    const botMsg = document.createElement('div');
    botMsg.className = 'dw-message dw-bot';
    botMsg.innerHTML = '<span style="opacity:0.5">···</span>';
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
