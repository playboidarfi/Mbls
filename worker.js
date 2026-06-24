// worker.js
let lastImageData = null;

self.onmessage = function(e) {
    const { imageData, settings } = e.data;
    const curr = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    
    // Se não tiver o frame anterior, pula a renderização deste
    if (!lastImageData) {
        lastImageData = new Uint8ClampedArray(curr);
        self.postMessage({ imageData });
        return;
    }

    const prev = lastImageData;
    const output = new Uint8ClampedArray(curr);
    
    const blurAmount = settings.blurAmount; // Intensidade do RSMB
    const sensitivity = settings.sensitivity; // Sensibilidade ao movimento

    for (let i = 0; i < curr.length; i += 4) {
        // Calcula a diferença de movimento entre frames (Optical Flow simplificado)
        const diffR = Math.abs(curr[i] - prev[i]);
        const diffG = Math.abs(curr[i+1] - prev[i+1]);
        const diffB = Math.abs(curr[i+2] - prev[i+2]);
        const motion = (diffR + diffG + diffB) / 3;

        if (motion > sensitivity) {
            // Se houver movimento, mistura o frame atual com o anterior
            // Criando o efeito de "Motion Blur" direcional
            const alpha = Math.min(0.9, (motion / 255) * blurAmount);
            
            output[i]     = curr[i]     * (1 - alpha) + prev[i]     * alpha;
            output[i + 1] = curr[i + 1] * (1 - alpha) + prev[i + 1] * alpha;
            output[i + 2] = curr[i + 2] * (1 - alpha) + prev[i + 2] * alpha;
        } else {
            output[i]     = curr[i];
            output[i + 1] = curr[i + 1];
            output[i + 2] = curr[i + 2];
        }
        output[i + 3] = 255;
    }

    // Salva o frame atual para comparar com o próximo
    lastImageData.set(curr);

    self.postMessage({ 
        imageData: new ImageData(output, w, h) 
    });
};
