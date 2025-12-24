import { stateManager } from '../core/stateManager.js';

export function initInputHandler() {
    const input = document.getElementById('msgInput');

    // Sanitize and update state
    input.addEventListener('input', (e) => {
        const raw = e.target.value;
        // Basic sanitization: remove HTML tags
        const sanitized = raw.replace(/<[^>]*>?/gm, '');
        stateManager.setMessage(sanitized);
    });
}

export function setInputValue(text) {
    const input = document.getElementById('msgInput');
    input.value = text;
    stateManager.setMessage(text);
}
