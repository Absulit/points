import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';
import { isMobile } from 'utils';

const options = {
    scale: 1,
    isMobile: false,
    flip: true,
}


const notificationMsg = `This demo uses a webcam, but it seems you don't have one, \nso we replaced it with a video.`;

const base = {
    vert,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        options.isMobile = isMobile();
        points.setUniform('isMobile', options.isMobile);

        const size = { width: 1080, height: 1080 }
        if (options.isMobile) {
            size.width = 1280;
            size.height = 720;
        }

        points.setSampler('imageSampler', null);
        await points.setTextureWebcam('webcam', size)
            .catch(async err => {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification('Points - Webcam Texture 1', {
                        body: notificationMsg,
                        //icon: 'https://your-icon-url.png'
                    });
                } else {
                    alert(notificationMsg)
                }

                await points.setTextureVideo('webcam', './../img/6982698-hd_1440_1080_25fps_800x800.mp4');
            });


        points.setUniform('flip', options.flip);
        folder.add(options, 'flip').name('flip');

        folder.open();
    },
    update: points => {
        points.setUniform('flip', options.flip);
        points.setUniform('isMobile', options.isMobile);
    }
}

export default base;
