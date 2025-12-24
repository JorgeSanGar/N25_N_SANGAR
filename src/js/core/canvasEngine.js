import { stateManager } from './stateManager.js';
import { windowPoints, curveControl, windowCenter, maxChars } from './windowConfig.js';

export class CanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.noisePattern = null;
        this.bgImage = null; // Para el efecto blur

        this.init();
    }

    init() {
        // Pre-generar ruido
        this.generateNoise();

        // Cargar imagen para el efecto blur interno
        const img = new Image();
        img.src = '/assets/images/background.png';
        img.onload = () => {
            this.bgImage = img;
            this.resize();
        };

        window.addEventListener('resize', () => this.resize());
        this.initDrawingEvents();
    }

    generateNoise() {
        const noiseCanvas = document.createElement('canvas');
        noiseCanvas.width = 200;
        noiseCanvas.height = 200;
        const nCtx = noiseCanvas.getContext('2d');

        const idata = nCtx.createImageData(200, 200);
        const buffer32 = new Uint32Array(idata.data.buffer);
        const len = buffer32.length;

        for (let i = 0; i < len; i++) {
            if (Math.random() < 0.5) {
                // Blanco con alpha muy bajo
                buffer32[i] = 0x10ffffff;
            }
        }
        nCtx.putImageData(idata, 0, 0);
        this.noisePattern = this.ctx.createPattern(noiseCanvas, 'repeat');
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.canvas.classList.contains('active')) {
            this.drawFogWithText();
        }
    }

    drawFogWithText() {
        this.canvas.classList.add('active');
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;
        let message = stateManager.getMessage();

        // Truncar texto si es muy largo
        if (message.length > maxChars) {
            message = message.substring(0, maxChars) + "...";
        }

        // 1. Limpiar
        ctx.clearRect(0, 0, width, height);

        ctx.save();

        // 2. MÁSCARA DE RECORTE (Clipping Mask)
        this.defineWindowPath(ctx, width, height);
        ctx.clip();

        // 3. CAPA 1: FONDO DESENFOCADO (Simulación de refracción)
        // Dibujamos la imagen de fondo pero desenfocada DENTRO del cristal
        if (this.bgImage) {
            ctx.filter = 'blur(6px)';
            // Calcular ratio para "cover"
            const hRatio = width / this.bgImage.width;
            const vRatio = height / this.bgImage.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShift_x = (width - this.bgImage.width * ratio) / 2;
            const centerShift_y = (height - this.bgImage.height * ratio) / 2;

            ctx.drawImage(this.bgImage,
                0, 0, this.bgImage.width, this.bgImage.height,
                centerShift_x, centerShift_y, this.bgImage.width * ratio, this.bgImage.height * ratio
            );
            ctx.filter = 'none'; // Reset filter
        }

        // 4. CAPA 2: TINTE DE VAHO (Blanco frío)
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(220, 230, 240, 0.4)';
        ctx.fillRect(0, 0, width, height);

        // 5. CAPA 3: RUIDO (Gotitas)
        if (this.noisePattern) {
            ctx.fillStyle = this.noisePattern;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1.0;
        }

        // 6. CAPA 4: TEXTO (Goma de borrar)
        ctx.globalCompositeOperation = 'destination-out';
        ctx.shadowBlur = 10; // Borde suave
        ctx.shadowColor = 'rgba(0,0,0,1)';

        this.drawFittedText(ctx, message, width, height);

        ctx.restore();

        // 7. Borde sutil del cristal (Brillo)
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        this.defineWindowPath(ctx, width, height);
        ctx.stroke();
        ctx.restore();
    }

    defineWindowPath(ctx, w, h) {
        ctx.beginPath();
        const p = windowPoints;
        const c = curveControl;

        ctx.moveTo(p.tl.x * w, p.tl.y * h);

        // Curva Superior
        ctx.quadraticCurveTo(
            c.top.x * w, c.top.y * h,
            p.tr.x * w, p.tr.y * h
        );

        // Lado Derecho (Recto)
        ctx.lineTo(p.br.x * w, p.br.y * h);

        // Curva Inferior
        ctx.quadraticCurveTo(
            c.bottom.x * w, c.bottom.y * h,
            p.bl.x * w, p.bl.y * h
        );

        ctx.closePath();
    }

    drawFittedText(ctx, text, w, h) {
        // Configuración inicial
        let fontSize = 100;
        const minFontSize = 20;
        const maxW = (windowPoints.tr.x - windowPoints.tl.x) * w * 0.8; // 80% del ancho de ventana

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Función recursiva simulada con while
        ctx.font = `${fontSize}px 'Gochi Hand', cursive`;

        // 1. Ajuste de tamaño
        while (ctx.measureText(text).width > maxW && fontSize > minFontSize) {
            fontSize -= 2;
            ctx.font = `${fontSize}px 'Gochi Hand', cursive`;
        }

        // 2. Posicionamiento
        const x = w * windowCenter.x;
        const y = h * windowCenter.y;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-2 * Math.PI / 180); // Rotación -2deg

        // 3. Dibujado (Si sigue siendo muy largo, dividir en 2 líneas)
        if (ctx.measureText(text).width > maxW && text.includes(' ')) {
            const words = text.split(' ');
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(' ');
            const line2 = words.slice(mid).join(' ');

            ctx.fillText(line1, 0, -fontSize * 0.6);
            ctx.fillText(line2, 0, fontSize * 0.6);
        } else {
            ctx.fillText(text, 0, 0);
        }

        ctx.restore();
    }

    initDrawingEvents() {
        const start = (e) => { this.isDrawing = true; this.draw(e); };
        const end = () => { this.isDrawing = false; this.ctx.beginPath(); };

        this.canvas.addEventListener('mousedown', start);
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', end);

        this.canvas.addEventListener('touchstart', start, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e); }, { passive: false });
        this.canvas.addEventListener('touchend', end);
    }

    draw(e) {
        if (!this.isDrawing) return;
        const { x, y } = this.getPos(e);
        const ctx = this.ctx;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'black';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 30;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    getPos(e) {
        return e.touches ?
            { x: e.touches[0].clientX, y: e.touches[0].clientY } :
            { x: e.clientX, y: e.clientY };
    }
}
