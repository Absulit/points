export function resizeViewport(camera, renderer, bloomComposer = null, finalComponser = null) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (bloomComposer) {
        bloomComposer.setSize(window.innerWidth, window.innerHeight);
    }
    if (finalComponser) {
        finalComponser.setSize(window.innerWidth, window.innerHeight);
    }
}


'use strict';

/**
 * Gets all the uri parts in an array.
 */
export const uriParts = () => window.location.pathname.split('/').filter(s => s.length >= 0);

/**
 * Changes uri.
 * @param {string} uri
 */
export function changeUri(uri) { window.history.pushState('', '', `${uri}`) };

/**
 * `<input type="datetime-local">` value
 * @param {String} dateTimeLocalValue string with a date to be converted
 */
export function dateTimeLocalToPHPDate(dateTimeLocalValue) {
    // 2021-10-01 20:14:25
    const dateTime = new Date(dateTimeLocalValue);
    const utcDate = padNumber(dateTime.getUTCDate());
    const utcMonth = padNumber(dateTime.getUTCMonth() + 1);
    const utcYear = dateTime.getUTCFullYear();
    const utcHours = padNumber(dateTime.getUTCHours());
    const utcMinutes = padNumber(dateTime.getUTCMinutes());
    const utcSeconds = padNumber(dateTime.getUTCSeconds());

    return `${utcYear}-${utcMonth}-${utcDate} ${utcHours}:${utcMinutes}:${utcSeconds}`;
}

/**
 * `<input type="date">` value
 * @param {String} dateValue string with a date to be converted
 */
export function dateToPHPDate(dateValue) {
    // 2021-10-01 20:14:25
    const dateTime = new Date(dateValue + ' 00:00:00');
    const utcDate = padNumber(dateTime.getUTCDate());
    const utcMonth = padNumber(dateTime.getUTCMonth() + 1);
    const utcYear = dateTime.getUTCFullYear();
    const utcHours = padNumber(dateTime.getUTCHours());
    const utcMinutes = padNumber(dateTime.getUTCMinutes());
    const utcSeconds = padNumber(dateTime.getUTCSeconds());

    return `${utcYear}-${utcMonth}-${utcDate} ${utcHours}:${utcMinutes}:${utcSeconds}`;
}

/**
 * Converts a PHPDate into a Date required by `<input type="datetime-local">`
 * @param {String} phpDate Date with this format `2021-10-01 20:14:25`
 * @returns Date with this format `yyyy-MM-ddThh:mm:ss`
 */
export function phpDateToDateTimeLocal(phpDate) {
    //The format is "yyyy-MM-ddThh:mm" followed by optional ":ss" or ":ss.SSS".
    const utcDateTime = new Date(phpDate + ' UTC');
    const year = utcDateTime.getFullYear();
    const month = padNumber(utcDateTime.getMonth() + 1);
    const day = padNumber(utcDateTime.getDate());
    const hours = padNumber(utcDateTime.getHours());
    const minutes = padNumber(utcDateTime.getMinutes());
    const seconds = padNumber(utcDateTime.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Converts a PHPDate into a Date required by `<input type="date">`
 * @param {String} phpDate Date with this format `2021-10-01`
 * @returns Date with this format `yyyy-MM-dd`
 */
export function phpDateToDate(phpDate) {
    //The format is "yyyy-MM-dd".
    const utcDateTime = new Date(phpDate + ' UTC');
    const year = utcDateTime.getFullYear();
    const month = padNumber(utcDateTime.getMonth() + 1);
    const day = padNumber(utcDateTime.getDate());

    return `${day}-${month}-${year}`;
}

function padNumber(number) {
    return String(number).padStart(2, '0');
}

/**
 * Shows or hides an `HTMLElement` using Spectre classes.
 * This one mantains the block.
 * @param {HTMLElement} el DOM Element to hide.
 * @param {boolean} isVisible If it's visible or not.
 */
export function setVisible(el, isVisible) {
    el.classList.toggle('d-visible', isVisible);
    el.classList.toggle('d-invisible', !isVisible);
}

/**
 * Shows or hides an `HTMLElement` using Spectre classes.
 * This one hides the block.
 * @param {HTMLElement} el DOM Element to hide.
 * @param {boolean} isVisible If it's visible or not.
 */
export function setHidden(el, isVisible) {
    el.classList.toggle('d-hide', !isVisible);
}

export function setDisabled(el, value) {
    el.disabled = value;
    el.classList.toggle('disabled', value);
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export function isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function _checkToHideScroll() {
    const descriptionOverflown = (document.documentElement.scrollHeight - 10) > document.documentElement.clientHeight;
    document.body.style.overflowY = descriptionOverflown ? 'scroll' : 'hidden';
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
export function formatDateYearMonth(date) {
    let result = '';
    if (date) {
        const localDate = new Date(`${date} 00:00:00`);
        const year = localDate.getFullYear();
        const month = monthNames[localDate.getMonth()];
        result = `${month} - ${year}`;
    }
    return result;
}

export function isMobile() {
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4));
}

export function changeTitle(value){
    document.querySelector('title').innerText = value;
}
