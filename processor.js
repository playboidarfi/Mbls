// processor.js
self.onmessage = function(e) {
    const { imageData, settings } = e.data;
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    const lift = settings.lift;
    const gamma = settings.gamma;
    const gain = settings.gain;
    const halation = settings.halation;
    const vignette = settings.vignette;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;

        // --- 1. LIFT, GAMMA, GAIN (Color Wheels) ---
        // Gain
        r *= gain.r; g *= gain.g; b *= gain.b;
        // Lift
        r = r * (1 - lift) + lift;
        g = g * (1 - lift) + lift;
        b = b * (1 - lift) + lift;
        // Gamma
        r = Math.pow(Math.max(0, r), 1 / gamma);
        g = Math.pow(Math.max(0, g), 1 / gamma);
        b = Math.pow(Math.max(0, b), 1 / gamma);

        // --- 2. HALATION (Simulação de sangramento de luz) ---
        if (halation > 0) {
            let lum = (r + g + b) / 3;
            if (lum > 0.6) {
                r += (lum - 0.6) * halation;
            }
        }

        // --- 3. VIGNETTE ---
        if (vignette > 0) {
            const idx = i / 4;
            const x = idx % w;
            const y = Math.floor(idx / w);
            const dx = (x - w / 2) / (w / 2);
            const dy = (y - h / 2) / (h / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const vFactor = Math.max(0, 1 - (dist * vignette * 0.5));
            r *= vFactor; g *= vFactor; b *= vFactor;
        }

        // --- CLAMP E VOLTA PARA 0-255 ---
        data[i] = Math.min(255, Math.max(0, r * 255));
        data[i + 1] = Math.min(255, Math.max(0, g * 255));
        data[i + 2] = Math.min(255, Math.max(0, b * 255));
    }

    self.postMessage({ imageData }, [imageData.data.buffer]);
};
