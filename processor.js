// processor.js
self.onmessage = function(e) {
    const { imageData, settings, isFinalRender } = e.data;
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    // Extrair parâmetros das Color Wheels (Lift, Gamma, Gain)
    const { lift, gamma, gain, vignette, halation } = settings;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;

        // --- 1. COLOR WHEELS (LIFT, GAMMA, GAIN) ---
        // Gain: Multiplica os highlights
        r *= gain.r; g *= gain.g; b *= gain.b;

        // Lift: Ajusta os pretos (offset)
        r = r * (1 - lift.r) + lift.r;
        g = g * (1 - lift.g) + lift.g;
        b = b * (1 - lift.b) + lift.b;

        // Gamma: Ajusta os tons médios (potência)
        r = Math.pow(Math.max(0, r), 1 / gamma.r);
        g = Math.pow(Math.max(0, g), 1 / gamma.g);
        b = Math.pow(Math.max(0, b), 1 / gamma.b);

        // --- 2. SIMULAÇÃO DE HALATION (Red Bleed) ---
        // Se o pixel for muito brilhante, ele "vaza" vermelho para os vizinhos
        if (halation > 0) {
            let brightness = (r + g + b) / 3;
            if (brightness > 0.8) {
                r += (brightness - 0.8) * halation;
            }
        }

        // --- 3. VIGNETTE ---
        if (vignette > 0) {
            const x = (i / 4) % w;
            const y = Math.floor((i / 4) / w);
            const dx = (x - w / 2) / (w / 2);
            const dy = (y - h / 2) / (h / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const vFactor = Math.max(0, 1 - dist * vignette);
            r *= vFactor; g *= vFactor; b *= vFactor;
        }

        data[i] = r * 255;
        data[i + 1] = g * 255;
        data[i + 2] = b * 255;
    }

    self.postMessage({ imageData }, [imageData.data.buffer]);
};