/**
 * @example
 * const recorder = new CanvasRecorder(canvas);
 */

class CanvasRecorder {
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

    /**
     * Starts the video recording.
     */
    start() {
        const videoStream = this.#canvas.captureStream(60);
        let chunks = [];
        this.mediaRecorder = new MediaRecorder(videoStream, this.#options);
        this.mediaRecorder.ondataavailable = e => chunks.push(e.data);
        this.mediaRecorder.onstop = _ => {
            const blob = new Blob(chunks, { 'type': this.#options.mimeType });
            chunks = [];
            const url = URL.createObjectURL(blob);
            this.#linkToDownload(url, 'video', 'webm')

        };
        this.mediaRecorder.start();
    }

    /**
     * Stops the video recording and downloads the video.
     */
    stop() {
        this.mediaRecorder.stop();
    }

    /**
     * Retrieves the current frame as a PNG and downloads the image.
     */
    getPNG() {
        this.#canvas.toBlob(
            blob => {
                const url = URL.createObjectURL(blob)
                this.#linkToDownload(url, 'image', 'png')
                URL.revokeObjectURL(url);
            },
            'image/png',
            0.95,
        );
    }

    #linkToDownload(url, prefix, ext){
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix}_${(new Date()).getTime()}.${ext}`;
        a.click();
    }
}

export default CanvasRecorder;

