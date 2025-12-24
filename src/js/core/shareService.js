import { windowPoints, curveControl } from './windowConfig.js';

export class ShareService {
    constructor(canvasId, bgUrl) {
        this.sourceCanvas = document.getElementById(canvasId);
        this.bgUrl = bgUrl;
    }

    async share() {
        const finalC = document.createElement('canvas');
        finalC.width = this.sourceCanvas.width;
        finalC.height = this.sourceCanvas.height;
        const fCtx = finalC.getContext('2d');

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = this.bgUrl;

        return new Promise((resolve, reject) => {
            img.onload = async () => {
                // A. Draw Background (Sharp)
                const hRatio = finalC.width / img.width;
                const vRatio = finalC.height / img.height;
                const ratio = Math.max(hRatio, vRatio);
                const centerShift_x = (finalC.width - img.width * ratio) / 2;
                const centerShift_y = (finalC.height - img.height * ratio) / 2;

                fCtx.drawImage(img,
                    0, 0, img.width, img.height,
                    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
                );

                // B. Draw The Fog Canvas
                // The source canvas already contains:
                // 1. Blurred background (clipped)
                // 2. Fog tint
                // 3. Noise
                // 4. Transparent holes (text)
                // So drawing it on top of the sharp background will perfectly composite the effect.
                fCtx.drawImage(this.sourceCanvas, 0, 0);

                // C. Watermark
                fCtx.fillStyle = "rgba(255,255,255,0.9)";
                fCtx.font = "bold 14px 'Inter', sans-serif";
                fCtx.textAlign = "center";
                fCtx.shadowBlur = 4;
                fCtx.shadowColor = "rgba(0,0,0,0.8)";

                fCtx.fillText("Díselo con el corazón - Neumáticos Sangar", finalC.width / 2, finalC.height - 40);

                // D. Export
                finalC.toBlob(async (blob) => {
                    if (!blob) {
                        reject('Canvas empty');
                        return;
                    }
                    const file = new File([blob], "mensaje-sangar.jpg", { type: "image/jpeg" });

                    const shareData = {
                        files: [file],
                        title: 'Mensaje en el cristal',
                        text: 'Te he dejado un mensaje en el cristal del coche... ❤️ Escribe el tuyo aquí: https://hangar-navidad.com'
                    };

                    if (navigator.share && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share(shareData);
                            resolve(true);
                        } catch (err) {
                            console.log('Share cancelled or failed', err);
                            resolve(false);
                        }
                    } else {
                        const link = document.createElement('a');
                        link.download = 'mensaje-sangar.jpg';
                        link.href = finalC.toDataURL('image/jpeg', 0.9);
                        link.click();
                        resolve('downloaded');
                    }
                }, 'image/jpeg', 0.9);
            };
            img.onerror = reject;
        });
    }
}
