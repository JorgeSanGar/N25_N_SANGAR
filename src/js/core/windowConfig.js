// Coordenadas relativas (0.0 a 1.0) basadas en la imagen del interior del coche
export const windowShape = [
    { x: 0.12, y: 0.32 }, // Top Left (A-pillar start)
    { x: 0.50, y: 0.24 }, // Top Middle (Curve apex)
    { x: 0.95, y: 0.25 }, // Top Right (B-pillar top)
    { x: 0.90, y: 0.575 }, // Bottom Right (Door sill end)
    { x: 0.26, y: 0.575 }  // Bottom Left (Mirror/Door sill start)
];

// Centro visual de la ventana para el texto
export const windowCenter = {
    x: 0.58,
    y: 0.42
};

// Ancho máximo aproximado de la ventana (para cálculos de texto)
export const windowWidthRatio = 0.7; // 70% del ancho de pantalla
