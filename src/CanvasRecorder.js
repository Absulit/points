export default class CanvasRecorder {
    #canvas = null;
    #options = null;

    /**
     * Records video from a Canvas to a file.
     * @param {HTMLCanvasElement} canvas Canvas to record
     * @param {Object} options `MediaRecorder` options
     */
    constructor(canvas, options) {
        this.#canvas = canvas;
        this.#options = options || {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 6000000,
            mimeType: 'video/webm',
        };
    }

    start() {
        const videoStream = this.#canvas.captureStream(60);
        let chunks = [];
        this.mediaRecorder = new MediaRecorder(videoStream, this.#options);
        this.mediaRecorder.ondataavailable = e => chunks.push(e.data);
        this.mediaRecorder.onstop = _ => {
            const blob = new Blob(chunks, { 'type': this.#options.mimeType });
            chunks = [];
            let videoURL = URL.createObjectURL(blob);
            window.open(videoURL);
        };
        this.mediaRecorder.start();
    }
    stop() {
        this.mediaRecorder.stop();
    }

    getPNG() {
        this.#canvas.toBlob(
            blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a');
                a.href = url;
                a.download = `image_${(new Date()).getTime()}.png`;
                a.click();
                URL.revokeObjectURL(url);
            },
            'image/png',
            0.95,
        );
    }
}
