// worker.js
self.onmessage = function(e) {
    const { imageData, settings, stripIndex } = e.data;
    const data = imageData.data;
    const len = data.length;

    const { lift, gamma, gain, halation, vignette } = settings;

    for (let i = 0; i < len; i += 4) {
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;

        // 1. Gain (Highlights) + Tint
        r *= gain.r; g *= gain.g; b *= gain.b;

        // 2. Lift (Shadows)
        r = r * (1 - lift) + lift;
        g = g * (1 - lift) + lift;
        b = b * (1 - lift) + lift;

        // 3. Gamma (Midtones)
        r = Math.pow(Math.max(0, r), 1 / gamma);
        g = Math.pow(Math.max(0, g), 1 / gamma);
        b = Math.pow(Math.max(0, b), 1 / gamma);

        // 4. Simple Halation
        if (halation > 0) {
            let lum = (r + g + b) / 3;
            if (lum > 0.7) r += (lum - 0.7) * halation;
        }

        // Saída (Clamp 0-255)
        data[i] = r * 255;
        data[i + 1] = g * 255;
        data[i + 2] = b * 255;
    }

    // Devolve a fatia processada
    self.postMessage({ imageData, stripIndex }, [imageData.data.buffer]);
};