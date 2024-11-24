export default class CanvasRecorder {
    #canvas = null;
    #options = null;

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
        const chunks = [];
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

    getPNG(){
        const image = this.#canvas.toDataURL().replace('image/png', 'image/octet-stream');
        window.location.href = image;
    }
}
