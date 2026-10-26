(function() {
    // Wheedle AI WhatsApp Floating Widget
    const script = document.currentScript;
    if (!script) return;

    const phone = (script.getAttribute('data-phone') || '').replace(/[^0-9]/g, '');
    const title = script.getAttribute('data-title') || 'AI WhatsApp Assistant';
    const subtitle = script.getAttribute('data-subtitle') || 'Online | Replies instantly';
    const greeting = script.getAttribute('data-greeting') || 'Hi there! 👋 How can our AI agent assist you today?';
    const position = script.getAttribute('data-position') || 'right'; // 'right' or 'left'
    const brandColor = script.getAttribute('data-color') || '#25D366';

    const containerId = 'wheedle-wa-widget-container';
    if (document.getElementById(containerId)) return;

    const styles = `
        #${containerId} {
            position: fixed;
            bottom: 24px;
            ${position === 'left' ? 'left: 24px;' : 'right: 24px;'}
            z-index: 9999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .wa-floating-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${brandColor};
            box-shadow: 0 4px 18px rgba(37, 211, 102, 0.45), 0 8px 30px rgba(0,0,0,0.18);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
        }
        .wa-floating-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 22px rgba(37, 211, 102, 0.6);
        }
        .wa-pulse {
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid ${brandColor};
            animation: waPulseAnim 2s infinite;
            opacity: 0;
        }
        @keyframes waPulseAnim {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.18); opacity: 0; }
            100% { transform: scale(0.95); opacity: 0; }
        }
        .wa-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 14px;
            height: 14px;
            background: #ff3b30;
            border-radius: 50%;
            border: 2px solid #fff;
        }
        .wa-popup-card {
            position: fixed;
            bottom: 96px;
            ${position === 'left' ? 'left: 24px;' : 'right: 24px;'}
            width: 340px;
            max-width: calc(100vw - 48px);
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.22);
            overflow: hidden;
            display: none;
            flex-direction: column;
            border: 1px solid rgba(0,0,0,0.08);
            animation: waSlideIn 0.25s ease-out forwards;
        }
        @keyframes waSlideIn {
            from { transform: translateY(16px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .wa-popup-header {
            background: ${brandColor};
            padding: 16px;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .wa-header-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .wa-avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(255,255,255,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }
        .wa-close-btn {
            background: none;
            border: none;
            color: rgba(255,255,255,0.85);
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
            line-height: 1;
        }
        .wa-popup-body {
            background: #e5ddd5;
            background-image: radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px);
            background-size: 14px 14px;
            padding: 16px;
            min-height: 120px;
        }
        .wa-chat-bubble {
            background: #ffffff;
            padding: 12px 14px;
            border-radius: 12px;
            border-top-left-radius: 2px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            font-size: 13px;
            color: #111827;
            line-height: 1.45;
        }
        .wa-popup-footer {
            background: #f0f2f5;
            padding: 12px;
            display: flex;
            gap: 8px;
        }
        .wa-input-box {
            flex: 1;
            padding: 10px 12px;
            border-radius: 20px;
            border: 1px solid #d1d5db;
            font-size: 13px;
            background: #ffffff;
            outline: none;
        }
        .wa-send-btn {
            background: ${brandColor};
            border: none;
            border-radius: 50%;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .wa-send-btn:hover {
            transform: scale(1.05);
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);

    const container = document.createElement('div');
    container.id = containerId;
    container.innerHTML = `
        <div class="wa-popup-card" id="wheedle-wa-popup">
            <div class="wa-popup-header">
                <div class="wa-header-info">
                    <div class="wa-avatar">🤖</div>
                    <div>
                        <div style="font-weight: 700; font-size: 14px;">${title}</div>
                        <div style="font-size: 11px; opacity: 0.9;">${subtitle}</div>
                    </div>
                </div>
                <button class="wa-close-btn" id="wheedle-wa-close">&times;</button>
            </div>
            <div class="wa-popup-body">
                <div class="wa-chat-bubble">
                    ${greeting}
                </div>
            </div>
            <div class="wa-popup-footer">
                <input type="text" class="wa-input-box" id="wheedle-wa-input" placeholder="Type your message..." />
                <button class="wa-send-btn" id="wheedle-wa-send" title="Send on WhatsApp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>

        <div class="wa-floating-btn" id="wheedle-wa-bubble" title="Chat on WhatsApp">
            <div class="wa-pulse"></div>
            <div class="wa-badge"></div>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
        </div>
    `;

    document.body.appendChild(container);

    const bubble = document.getElementById('wheedle-wa-bubble');
    const popup = document.getElementById('wheedle-wa-popup');
    const closeBtn = document.getElementById('wheedle-wa-close');
    const sendBtn = document.getElementById('wheedle-wa-send');
    const input = document.getElementById('wheedle-wa-input');

    let isOpen = false;

    function togglePopup() {
        isOpen = !isOpen;
        if (popup) {
            popup.style.display = isOpen ? 'flex' : 'none';
        }
        if (isOpen && input) {
            setTimeout(() => input.focus(), 100);
        }
    }

    function sendToWhatsApp() {
        const text = input ? input.value.trim() : '';
        const msg = text || greeting;
        const targetPhone = phone || '14155238886';
        const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        if (input) input.value = '';
        togglePopup();
    }

    bubble?.addEventListener('click', togglePopup);
    closeBtn?.addEventListener('click', togglePopup);
    sendBtn?.addEventListener('click', sendToWhatsApp);
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendToWhatsApp();
    });
})();
