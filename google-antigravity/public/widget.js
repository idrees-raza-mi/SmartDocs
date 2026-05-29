(function () {
  var SCRIPT_URL = document.currentScript.src;
  var BASE_URL = new URL(SCRIPT_URL).origin;
  var CHATBOT_ID = document.currentScript.getAttribute('data-chatbot-id');

  if (!CHATBOT_ID) {
    console.error('SmartDocs: Missing data-chatbot-id attribute on script tag.');
    return;
  }

  function pickTextColor(bg) {
    try {
      var c = bg.replace('#', '');
      var h = c.length === 3 ? c.split('').map(function (x) { return x + x; }).join('') : c;
      var r = parseInt(h.slice(0, 2), 16);
      var g = parseInt(h.slice(2, 4), 16);
      var b = parseInt(h.slice(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#000000' : '#ffffff';
    } catch (e) { return '#ffffff'; }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  // Minimal, safe-ish markdown renderer. Handles: **bold**, *italic*, `code`,
  // ```fenced code```, [link](url), - lists, paragraphs, line breaks.
  function renderMarkdown(md) {
    var src = escapeHtml(md);

    // Fenced code blocks
    src = src.replace(/```([^`]*)```/g, function (_, code) {
      return '<pre><code>' + code.replace(/^\n/, '').replace(/\n$/, '') + '</code></pre>';
    });
    // Inline code
    src = src.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold + italic
    src = src.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    src = src.replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em>$2</em>');
    // Links — only http(s)
    src = src.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Lists: lines starting with - or *
    var lines = src.split('\n');
    var out = [];
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var listMatch = line.match(/^[-*]\s+(.+)$/);
      if (listMatch) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + listMatch[1] + '</li>');
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line);
      }
    }
    if (inList) out.push('</ul>');

    // Convert blank-line separated paragraphs.
    var joined = out.join('\n');
    var paras = joined.split(/\n{2,}/).map(function (p) {
      if (/^<(ul|pre|h\d)/.test(p.trim())) return p;
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    });
    return paras.join('');
  }

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m.pop()) : null;
  }
  function setCookie(name, value, days) {
    var expires = '';
    if (days) { var d = new Date(); d.setTime(d.getTime() + days * 864e5); expires = '; expires=' + d.toUTCString(); }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  function init(config) {
    var accent = config.accent_color || '#ffffff';
    var fg = pickTextColor(accent);
    var botName = config.name || 'Support';
    var welcome = config.welcome_message || 'Hi! How can I help you today?';
    var placeholder = config.placeholder_text || 'Ask me anything...';
    var showBranding = config.show_branding !== false;
    var position = config.widget_position === 'bottom-left' ? 'bottom-left' : 'bottom-right';
    var leadCaptureMode = config.lead_capture_mode || 'off';
    var gdprRequired = !!config.gdpr_consent;
    var suggestedQuestions = Array.isArray(config.suggested_questions) ? config.suggested_questions.slice(0, 3) : [];

    var sessionKey = 'smartdocs_session_' + CHATBOT_ID;
    var sessionId = localStorage.getItem(sessionKey);
    var isReturning = !!sessionId;
    if (!sessionId) {
      sessionId = 'sd_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(sessionKey, sessionId);
    }

    var leadCapturedKey = 'smartdocs_lead_' + CHATBOT_ID;
    var leadCaptured = !!localStorage.getItem(leadCapturedKey);

    var consentGiven = getCookie('smartdocs_consent_' + CHATBOT_ID) === '1';

    var positionCss = position === 'bottom-left'
      ? 'bottom: 24px; left: 24px;'
      : 'bottom: 24px; right: 24px;';
    var windowAnchor = position === 'bottom-left' ? 'left: 0;' : 'right: 0;';

    var style = document.createElement('style');
    style.textContent = [
      '#sd-widget-container { position: fixed; ' + positionCss + ' z-index: 999999; font-family: system-ui, -apple-system, sans-serif; }',
      '#sd-bubble { width: 56px; height: 56px; border-radius: 50%; background-color: ' + accent + '; color: ' + fg + '; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 24px rgba(0,0,0,0.25); transition: transform 0.2s, box-shadow 0.2s; }',
      '#sd-bubble:hover { transform: scale(1.08); }',
      '#sd-window { position: absolute; bottom: 72px; ' + windowAnchor + ' width: 360px; height: 540px; background: #0f0f0f; border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08); display: none; flex-direction: column; overflow: hidden; }',
      '@media (max-width: 640px) { #sd-window { position: fixed; inset: 0; width: 100vw; height: 100vh; border-radius: 0; } }',
      '#sd-header { background: ' + accent + '; color: ' + fg + '; padding: 14px 16px; font-weight: 700; font-size: 15px; display: flex; justify-content: space-between; align-items: center; }',
      '#sd-close { cursor: pointer; background: rgba(0,0,0,0.15); border: none; color: ' + fg + '; font-size: 18px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }',
      '#sd-messages { flex: 1; padding: 16px; overflow-y: auto; background: #0a0a0a; display: flex; flex-direction: column; gap: 12px; }',
      '#sd-messages::-webkit-scrollbar { width: 4px; }',
      '#sd-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }',
      '.sd-message { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }',
      '.sd-message p { margin: 0 0 8px 0; } .sd-message p:last-child { margin-bottom: 0; }',
      '.sd-message ul { margin: 6px 0; padding-left: 18px; } .sd-message li { margin: 2px 0; }',
      '.sd-message code { background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }',
      '.sd-message pre { background: rgba(0,0,0,0.6); padding: 8px 10px; border-radius: 8px; overflow-x: auto; margin: 6px 0; }',
      '.sd-message pre code { background: transparent; padding: 0; }',
      '.sd-message a { color: ' + accent + '; text-decoration: underline; }',
      '.sd-user { align-self: flex-end; background: ' + accent + '; color: ' + fg + '; border-bottom-right-radius: 4px; }',
      '.sd-bot { align-self: flex-start; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.92); border: 1px solid rgba(255,255,255,0.08); border-bottom-left-radius: 4px; }',
      '.sd-citations { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }',
      '.sd-citation { font-size: 10px; padding: 2px 6px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); border-radius: 4px; }',
      '.sd-feedback { display: flex; gap: 6px; margin-top: 6px; }',
      '.sd-feedback button { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); width: 24px; height: 24px; border-radius: 6px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; font-size: 12px; }',
      '.sd-feedback button:hover { color: white; border-color: rgba(255,255,255,0.3); }',
      '.sd-feedback button.active { background: rgba(255,255,255,0.15); color: white; }',
      '.sd-followups { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }',
      '.sd-followup-btn { text-align: left; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); padding: 8px 12px; border-radius: 10px; font-size: 13px; cursor: pointer; transition: all 0.15s; }',
      '.sd-followup-btn:hover { background: rgba(255,255,255,0.1); border-color: ' + accent + '; }',
      '.sd-typing { display: inline-flex; gap: 4px; align-items: center; }',
      '.sd-typing span { width: 6px; height: 6px; background: rgba(255,255,255,0.4); border-radius: 50%; animation: sd-bounce 1.2s infinite; }',
      '.sd-typing span:nth-child(2) { animation-delay: 0.15s; } .sd-typing span:nth-child(3) { animation-delay: 0.3s; }',
      '@keyframes sd-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }',
      '#sd-input-area { padding: 12px; background: #0f0f0f; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 8px; align-items: center; }',
      '#sd-input { flex: 1; padding: 9px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; outline: none; font-size: 14px; background: rgba(255,255,255,0.04); color: white; }',
      '#sd-input:focus { border-color: ' + accent + '; }',
      '#sd-send { background: ' + accent + '; color: ' + fg + '; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '#sd-send:disabled { opacity: 0.4; cursor: not-allowed; }',
      '#sd-branding { text-align: center; padding: 6px 0 8px; font-size: 11px; color: rgba(255,255,255,0.2); background: #0f0f0f; }',
      '#sd-branding a { color: rgba(255,255,255,0.4); text-decoration: none; }',
      '.sd-consent { padding: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; }',
      '.sd-consent button { background: ' + accent + '; color: ' + fg + '; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; margin-top: 8px; }',
      '.sd-lead { padding: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; margin-top: 8px; }',
      '.sd-lead h4 { color: white; font-size: 13px; margin: 0 0 6px 0; }',
      '.sd-lead p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 10px 0; }',
      '.sd-lead input { width: 100%; padding: 7px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 6px; font-size: 13px; margin-bottom: 6px; outline: none; }',
      '.sd-lead button { background: ' + accent + '; color: ' + fg + '; border: none; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; width: 100%; }',
      '.sd-lead button.secondary { background: transparent; color: rgba(255,255,255,0.4); margin-top: 4px; }',
    ].join('\n');
    document.head.appendChild(style);

    var container = document.createElement('div');
    container.id = 'sd-widget-container';

    var brandingHtml = showBranding
      ? '<div id="sd-branding">Powered by <a href="' + BASE_URL + '" target="_blank" rel="noopener">SmartDocs</a></div>'
      : '';

    container.innerHTML =
      '<div id="sd-window" role="dialog" aria-label="' + escapeHtml(botName) + ' chat">' +
        '<div id="sd-header">' +
          '<span>' + escapeHtml(botName) + '</span>' +
          '<button id="sd-close" aria-label="Close chat">&times;</button>' +
        '</div>' +
        '<div id="sd-messages"></div>' +
        '<div id="sd-input-area">' +
          '<input type="text" id="sd-input" placeholder="' + escapeHtml(placeholder) + '" autocomplete="off" />' +
          '<button id="sd-send" aria-label="Send message">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          '</button>' +
        '</div>' +
        brandingHtml +
      '</div>' +
      '<div id="sd-bubble" aria-label="Open chat">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '</div>';
    document.body.appendChild(container);

    var bubble = document.getElementById('sd-bubble');
    var chatWindow = document.getElementById('sd-window');
    var closeBtn = document.getElementById('sd-close');
    var input = document.getElementById('sd-input');
    var sendBtn = document.getElementById('sd-send');
    var messagesDiv = document.getElementById('sd-messages');

    function scrollDown() { messagesDiv.scrollTop = messagesDiv.scrollHeight; }

    function addBotMessage(text, opts) {
      opts = opts || {};
      var wrap = document.createElement('div');
      wrap.className = 'sd-message sd-bot';
      wrap.innerHTML = renderMarkdown(text);

      if (opts.sources && opts.sources.length) {
        var cites = document.createElement('div');
        cites.className = 'sd-citations';
        opts.sources.forEach(function (s) {
          var chip = document.createElement('span');
          chip.className = 'sd-citation';
          chip.textContent = s;
          cites.appendChild(chip);
        });
        wrap.appendChild(cites);
      }

      if (opts.messageId) {
        var fb = document.createElement('div');
        fb.className = 'sd-feedback';
        ['1', '-1'].forEach(function (v) {
          var btn = document.createElement('button');
          btn.textContent = v === '1' ? '👍' : '👎';
          btn.title = v === '1' ? 'Helpful' : 'Not helpful';
          btn.onclick = function () {
            fetch(BASE_URL + '/api/messages/' + opts.messageId + '/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ value: Number(v) }),
            }).catch(function () { /* swallow */ });
            fb.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
          };
          fb.appendChild(btn);
        });
        wrap.appendChild(fb);
      }
      messagesDiv.appendChild(wrap);
      scrollDown();
      return wrap;
    }

    function addUserMessage(text) {
      var div = document.createElement('div');
      div.className = 'sd-message sd-user';
      div.textContent = text;
      messagesDiv.appendChild(div);
      scrollDown();
    }

    function showSuggestedFollowups(questions) {
      if (!questions || !questions.length) return;
      var wrap = document.createElement('div');
      wrap.className = 'sd-followups';
      questions.forEach(function (q) {
        var btn = document.createElement('button');
        btn.className = 'sd-followup-btn';
        btn.textContent = q;
        btn.onclick = function () {
          wrap.remove();
          input.value = q;
          sendMessage();
        };
        wrap.appendChild(btn);
      });
      messagesDiv.appendChild(wrap);
      scrollDown();
    }

    function showLeadCapture(prompt) {
      if (leadCaptured || leadCaptureMode === 'off') return;
      var box = document.createElement('div');
      box.className = 'sd-lead';
      box.innerHTML =
        '<h4>' + (prompt || 'Stay in touch') + '</h4>' +
        '<p>Leave your contact so we can follow up.</p>' +
        '<input type="text" id="sd-lead-name" placeholder="Your name (optional)" />' +
        '<input type="email" id="sd-lead-email" placeholder="Your email" required />' +
        '<button id="sd-lead-save">Submit</button>' +
        (leadCaptureMode === 'required' ? '' : '<button class="secondary" id="sd-lead-skip">Skip</button>');
      messagesDiv.appendChild(box);
      scrollDown();

      box.querySelector('#sd-lead-save').onclick = function () {
        var email = box.querySelector('#sd-lead-email').value.trim();
        var name = box.querySelector('#sd-lead-name').value.trim();
        if (!email) { box.querySelector('#sd-lead-email').focus(); return; }
        fetch(BASE_URL + '/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatbotId: CHATBOT_ID, sessionId: sessionId, email: email, name: name }),
        }).catch(function () { /* swallow */ });
        leadCaptured = true;
        localStorage.setItem(leadCapturedKey, '1');
        box.remove();
      };
      var skipBtn = box.querySelector('#sd-lead-skip');
      if (skipBtn) skipBtn.onclick = function () {
        leadCaptured = true;
        localStorage.setItem(leadCapturedKey, '1');
        box.remove();
      };
    }

    function showConsent() {
      var box = document.createElement('div');
      box.className = 'sd-consent';
      box.innerHTML =
        '<div style="color: rgba(255,255,255,0.8); font-size: 12px;">' +
        'We use cookies and process your chat content to power this assistant. By clicking accept, you agree to our processing of your messages.' +
        '</div>' +
        '<button>Accept and continue</button>';
      messagesDiv.appendChild(box);
      box.querySelector('button').onclick = function () {
        setCookie('smartdocs_consent_' + CHATBOT_ID, '1', 365);
        consentGiven = true;
        box.remove();
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      };
      input.disabled = true;
      sendBtn.disabled = true;
      scrollDown();
    }

    // Initial render: welcome + (consent) + (suggested) + maybe lead capture
    var initialWelcome = isReturning ? 'Welcome back! ' + welcome : welcome;
    addBotMessage(initialWelcome, {});
    if (gdprRequired && !consentGiven) showConsent();
    showSuggestedFollowups(suggestedQuestions);

    var isOpen = false;
    var isSending = false;
    var messagesSent = 0;

    bubble.addEventListener('click', function () {
      isOpen = !isOpen;
      chatWindow.style.display = isOpen ? 'flex' : 'none';
      if (isOpen) input.focus();
    });
    closeBtn.addEventListener('click', function () {
      isOpen = false;
      chatWindow.style.display = 'none';
    });

    async function sendMessage() {
      if (isSending) return;
      if (gdprRequired && !consentGiven) return;
      var text = input.value.trim();
      if (!text) return;
      isSending = true;
      sendBtn.disabled = true;
      messagesSent++;

      addUserMessage(text);
      input.value = '';

      var botWrap = document.createElement('div');
      botWrap.className = 'sd-message sd-bot';
      botWrap.innerHTML = '<div class="sd-typing"><span></span><span></span><span></span></div>';
      messagesDiv.appendChild(botWrap);
      scrollDown();

      try {
        var response = await fetch(BASE_URL + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatbotId: CHATBOT_ID, message: text, sessionId: sessionId }),
        });

        if (!response.ok) {
          botWrap.innerHTML = renderMarkdown(response.status === 429
            ? "_You're sending messages too quickly. Please wait a moment._"
            : "Sorry, I'm having trouble connecting right now.");
          return;
        }

        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var streamed = '';
        var done = false;
        while (!done) {
          var pull = await reader.read();
          if (pull.done) { done = true; break; }
          streamed += decoder.decode(pull.value, { stream: true });

          var metaIdx = streamed.indexOf('__SMARTDOCS_META__');
          var visible = metaIdx >= 0 ? streamed.slice(0, metaIdx) : streamed;
          botWrap.innerHTML = renderMarkdown(visible.trim());
          scrollDown();
        }

        // Parse trailing metadata frame
        var metaIdx2 = streamed.indexOf('__SMARTDOCS_META__');
        var meta = {};
        if (metaIdx2 >= 0) {
          try { meta = JSON.parse(streamed.slice(metaIdx2 + '__SMARTDOCS_META__'.length).trim()); } catch (e) { /* ignore */ }
        }
        var finalText = metaIdx2 >= 0 ? streamed.slice(0, metaIdx2).trim() : streamed.trim();
        botWrap.remove();
        addBotMessage(finalText, {
          sources: meta.sources || [],
          messageId: meta.messageId,
        });

        // Lead capture trigger
        if (leadCaptureMode === 'after_first' && messagesSent === 1) showLeadCapture('Get a follow-up by email');
        else if (leadCaptureMode === 'required' && messagesSent === 1) showLeadCapture('Before we continue, please share your email');

        // Show follow-up suggestions for the next turn
        if (meta.followups && meta.followups.length) showSuggestedFollowups(meta.followups);

        if (meta.escalated && leadCaptureMode !== 'off') showLeadCapture("Want a human to reach out?");
      } catch (e) {
        botWrap.innerHTML = renderMarkdown('An error occurred while sending your message.');
      } finally {
        isSending = false;
        sendBtn.disabled = false;
        input.focus();
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  fetch(BASE_URL + '/api/chat/config?id=' + encodeURIComponent(CHATBOT_ID))
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
    .then(function (cfg) {
      if (cfg && cfg.is_active !== false) init(cfg);
      else console.error('SmartDocs: chatbot is disabled.');
    })
    .catch(function () { console.error('SmartDocs: failed to load chatbot configuration.'); });
})();
