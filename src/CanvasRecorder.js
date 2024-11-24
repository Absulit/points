export default class CanvasRecorder {
    #canvas = null;
    #options = null;
    videoStream = null;
    mediaRecorder = null;

    constructor(canvas, options) {
        this.#canvas = canvas;
        this.#options = options || {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 6000000,
            mimeType: 'video/webm',
        };
    }

    start() {
        this.videoStream = this.#canvas.captureStream(60);
        this.mediaRecorder = new MediaRecorder(this.videoStream, this.#options);
        let chunks = [];
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
}
