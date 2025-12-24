// Coordenadas relativas (0.0 a 1.0)
// Puntos base proporcionados por el experto
export const windowPoints = {
    tl: { x: 0.38, y: 0.28 }, // Top Left
    tr: { x: 0.92, y: 0.24 }, // Top Right
    br: { x: 0.92, y: 0.58 }, // Bottom Right
    bl: { x: 0.38, y: 0.65 }  // Bottom Left
};

// Configuración de curvas (Control points offsets)
// Ajustamos ligeramente para simular la curvatura del cristal
export const curveControl = {
    top: { x: 0.65, y: 0.22 },    // Tira hacia arriba el borde superior
    bottom: { x: 0.65, y: 0.63 }  // Tira hacia arriba/recto el borde inferior
};

export const windowCenter = {
    x: 0.65, // Centro visual ajustado al polígono
    y: 0.45
};

export const maxChars = 35;
