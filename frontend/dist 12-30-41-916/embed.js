(function() {
    // Configuration
    const script = document.currentScript;
    const agentId = script.getAttribute('data-agent-id');
    const baseUrl = window.location.origin; // Assuming the script is served from the same domain as the app
    // In production, you'd replace this with the actual production URL
    const productionUrl = 'http://localhost:5173'; 
    const embedUrl = `${productionUrl}/chatbot-embed/${agentId}`;

    if (!agentId) {
        console.error('AI Chatbot: data-agent-id is missing');
        return;
    }

    // Styles
    const styles = `
        #ai-chatbot-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #ai-chatbot-bubble {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #8b5cf6;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #ai-chatbot-bubble:hover {
            transform: scale(1.1);
        }
        #ai-chatbot-bubble svg {
            width: 30px;
            height: 30px;
            color: white;
        }
        #ai-chatbot-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            height: 600px;
            max-height: calc(100vh - 120px);
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            overflow: hidden;
            display: none;
            flex-direction: column;
            border: 1px solid rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            transform: translateY(20px);
            opacity: 0;
        }
        #ai-chatbot-container.active {
            display: flex;
            transform: translateY(0);
            opacity: 1;
        }
        #ai-chatbot-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        @media (max-width: 480px) {
            #ai-chatbot-container {
                width: calc(100vw - 40px);
                height: calc(100vh - 120px);
            }
        }
    `;

    // Inject Styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Create Elements
    const widget = document.createElement('div');
    widget.id = 'ai-chatbot-widget';

    const bubble = document.createElement('div');
    bubble.id = 'ai-chatbot-bubble';
    bubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`;

    const container = document.createElement('div');
    container.id = 'ai-chatbot-container';
    
    const iframe = document.createElement('iframe');
    iframe.id = 'ai-chatbot-iframe';
    iframe.src = embedUrl;
    
    container.appendChild(iframe);
    widget.appendChild(container);
    widget.appendChild(bubble);
    document.body.appendChild(widget);

    // Toggle logic
    let isOpen = false;
    bubble.onclick = function() {
        isOpen = !isOpen;
        if (isOpen) {
            container.style.display = 'flex';
            setTimeout(() => container.classList.add('active'), 10);
            bubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else {
            container.classList.remove('active');
            setTimeout(() => container.style.display = 'none', 300);
            bubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`;
        }
    };

})();
