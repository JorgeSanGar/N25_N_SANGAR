import { CanvasEngine } from '../core/canvasEngine.js';
import { setInputValue } from './inputHandler.js';

export class UIController {
    constructor() {
        this.setupScreen = document.getElementById('setup-screen');
        this.resultUI = document.getElementById('result-ui');
        this.canvasEngine = new CanvasEngine('fogCanvas');

        this.bindEvents();
    }

    bindEvents() {
        // Suggestion buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = btn.dataset.text;
                if (text) setInputValue(text);
            });
        });

        // Generate button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.transitionToCanvas();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                location.reload();
            });
        }
    }

    transitionToCanvas() {
        this.setupScreen.classList.add('slide-out');

        // Resize and draw
        this.canvasEngine.resize();
        this.canvasEngine.drawFogWithText();

        // Show result UI
        setTimeout(() => {
            this.resultUI.classList.add('show-result-ui');
        }, 600);
    }
}
