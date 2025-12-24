import './styles/main.css';
import './styles/components.css';
import './styles/animations.css';

import { UIController } from './js/ui/uiController.js';
import { initInputHandler } from './js/ui/inputHandler.js';
import { ShareService } from './js/core/shareService.js';

document.addEventListener('DOMContentLoaded', () => {
    initInputHandler();
    const ui = new UIController();

    // Lazy load share service when button is clicked
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = "Generando...";
            shareBtn.disabled = true;

            try {
                const shareService = new ShareService(
                    'fogCanvas',
                    '/assets/images/background.png'
                );
                const result = await shareService.share();
                if (result === 'downloaded') {
                    alert("Imagen guardada. ¡Envíala por WhatsApp!");
                }
            } catch (e) {
                console.error(e);
            } finally {
                shareBtn.innerHTML = originalText;
                shareBtn.disabled = false;
            }
        });
    }
});
