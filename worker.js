// 
let prevFrame = null;

self.onmessage = function(e) {
    const { imageData, settings } = e.data;
    const curr = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    if (!prevFrame || prevFrame.length !== curr.length) {
        prevFrame = new Uint8ClampedArray(curr);
        self.postMessage({ imageData });
        return;
    }

    const blur = settings.blur;
    const sens = settings.sensitivity;
    const output = new Uint8ClampedArray(curr.length);

    for (let i = 0; i < curr.length; i += 4) {
        // Detecta diferença entre frames (Movimento)
        const diff = (Math.abs(curr[i] - prevFrame[i]) + 
                      Math.abs(curr[i+1] - prevFrame[i+1]) + 
                      Math.abs(curr[i+2] - prevFrame[i+2])) / 3;

        if (diff > sens) {
            // Aplica o rastro de movimento (RSMB)
            output[i]     = curr[i]     * (1 - blur) + prevFrame[i]     * blur;
            output[i + 1] = curr[i + 1] * (1 - blur) + prevFrame[i + 1] * blur;
            output[i + 2] = curr[i + 2] * (1 - blur) + prevFrame[i + 2] * blur;
        } else {
            output[i]     = curr[i];
            output[i + 1] = curr[i + 1];
            output[i + 2] = curr[i + 2];
        }
        output[i + 3] = 255;
        
        // Memória para o próximo frame
        prevFrame[i] = output[i];
        prevFrame[i+1] = output[i+1];
        prevFrame[i+2] = output[i+2];
    }

    self.postMessage({ imageData: new ImageData(output, w, h) });
};
