/**
 * Utility methods to for the {@link Points#setTextureElement | setTextureElement()}
 * @module texture-string
 * @ignore
 */

/**
 * Get the CSS associated with a specific `HTMLElement`.
 * @param {HTMLElement} el
 * @returns {String} All the CSS associated to the `el` `HTMLElement`.
 */
export function getCSS(el) {
    const sheets = document.styleSheets;
    const matchedRules = [];

    for (const sheet of sheets) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of rules) {
                if (el.matches(rule.selectorText)) {
                    matchedRules.push(rule);
                }
            }
        } catch (e) {
            console.warn("Could not read stylesheet: " + sheet.href);
        }
    }
    return matchedRules;
}

/**
 * Renders a `HTMLElement` as image along with some CSS.
 * @param {HTMLElement} element Element to render.
 * @param {String} styles CSS styles to render the element with.
 * @returns {Promise<Image>}
 */
export async function elToImage(element, styles) {
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    console.log(width, height);

    styles ??= '';

    const htmlContent = new XMLSerializer().serializeToString(element);

    const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml">
                    <style>${styles}</style>
                    ${htmlContent}
                </div>
            </foreignObject>
        </svg>
    `;

    const encodedData = btoa(decodeURIComponent(encodeURIComponent(svgData)));
    const url = `data:image/svg+xml;base64,${encodedData}`;

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            reject(new Error('Failed to decode SVG.'));
        };

        img.src = url;
    });
}