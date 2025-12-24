import { stateManager } from './stateManager.js';
import { windowShape, windowCenter, windowWidthRatio } from './windowConfig.js';

export class CanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;

        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        this.initDrawingEvents();
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
        const message = stateManager.getMessage();

        // 1. Limpiar
        ctx.clearRect(0, 0, width, height);

        ctx.save();

        // 2. MÁSCARA DE RECORTE (Clipping Mask)
        this.defineWindowPath(ctx, width, height);
        ctx.clip();

        // 3. FONDO DE VAHO REALISTA
        // Usamos un gradiente radial para simular condensación natural (más densa en el centro/abajo)
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.8, 10,
            width * 0.5, height * 0.4, width * 0.8
        );
        gradient.addColorStop(0, 'rgba(220, 230, 255, 0.85)'); // Centro más blanco
        gradient.addColorStop(1, 'rgba(200, 215, 230, 0.65)'); // Bordes más transparentes

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 4. TEXTO (Destination-out para borrar el vaho)
        ctx.globalCompositeOperation = 'destination-out';

        // Lógica de AUTO-FIT (Ajuste dinámico de fuente)
        const maxTextWidth = width * windowWidthRatio;
        let fontSize = 120; // Empezar grande
        ctx.font = `${fontSize}px 'Gochi Hand', cursive`;

        // Reducir fuente hasta que quepa
        while (ctx.measureText(message).width > maxTextWidth && fontSize > 20) {
            fontSize -= 5;
            ctx.font = `${fontSize}px 'Gochi Hand', cursive`;
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Efecto de dedo (borde suave)
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0,0,0,1)';

        // Posicionar y rotar
        const textX = width * windowCenter.x;
        const textY = height * windowCenter.y;

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(-4 * Math.PI / 180); // Rotación sutil
        ctx.fillText(message, 0, 0);
        ctx.restore();

        // 5. Borde de condensación (Vignette interna)
        // Dibujamos un borde suave interior para dar volumen al cristal
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 15;
        ctx.filter = 'blur(8px)';
        this.defineWindowPath(ctx, width, height);
        ctx.stroke();
        ctx.filter = 'none';

        // Mantenemos el clip activo para que el usuario solo pueda dibujar dentro
        // No hacemos restore() del clip principal
    }

    defineWindowPath(ctx, w, h) {
        ctx.beginPath();
        const points = windowShape;
        ctx.moveTo(points[0].x * w, points[0].y * h);

        // Usamos curvas cuadráticas para suavizar las esquinas si es necesario,
        // pero con los puntos definidos, líneas rectas funcionan bien para el polígono.
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * w, points[i].y * h);
        }

        ctx.closePath();
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

        // Borrar vaho (dedo)
        ctx.globalCompositeOperation = 'destination-out';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'black';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 35;

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
