/**
 * Utility methods to for the {@link Points#setTextureElement | setTextureElement()}
 * https://web.archive.org/web/20181006205840/https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas
 * @module texture-element
 * @ignore
 */

const cache = new Map();

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
 * Gets the url of the font requested from the loaded CSS.
 * @param {String} familyName
 * @returns
 */
function getFontSource(familyName) {
    let source = null;
    for (let sheet of document.styleSheets) {
        try {
            for (let rule of sheet.cssRules) {
                if (rule instanceof CSSFontFaceRule) {
                    if (rule.style.fontFamily === familyName) {
                        const regex = /url\(['"]?([^'"]+)['"]?\)/;
                        const match = rule.style.src.match(regex);
                        if (match) {
                            const url = match[1];
                            source = {
                                url,
                                fontFace: rule.cssText
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Can\'t read stylesheet (CORS?): ', e);
        }
    }
    return source;
}

/**
 * From the css in the HTMLElement, get the font-family attribute value to be
 * used later to get the source.
 * @param {String} cssString
 * @returns
 */
function getFontFamily(cssString) {
    let fontFamily = null;
    const regex = /font-family:\s*([^;]+)/;
    const match = cssString.match(regex);
    if (match) {
        fontFamily = match[1].trim();
    }
    return fontFamily;
}

/**
 * Converts a font to b64 to embed in the foreingObject
 * @param {String} url path to font file
 * @returns
 */
async function fontToB64(url) {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Renders a `HTMLElement` as image along with some CSS.
 * @param {HTMLElement} element Element to render.
 * @param {String} styles CSS styles to render the element with.
 * @returns {Promise<Image>}
 */
export async function elToImage(element, styles) {
    const { offsetWidth: width, offsetHeight: height } = element;

    styles ??= '';
    const fontFamily = getFontFamily(styles);

    let fontFace = cache.get(fontFamily) || null;
    if (!fontFace && fontFamily) {
        const fontSource = getFontSource(fontFamily);
        if (fontSource) {
            const b64 = await fontToB64(fontSource.url);
            const regex = /url\((['"]?)[^'"]+\1\)/;
            fontFace = fontSource.fontFace.replace(regex, `url($1${b64}$1)`);
            cache.set(fontFamily, fontFace);
        }
    }
    fontFace ??= '';

    const htmlContent = new XMLSerializer().serializeToString(element);

    const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs><style type="text/css">${fontFace}${styles}</style></defs>
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml">${htmlContent}</div>
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

            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                resolve(url);
            });
        };

        img.onerror = () => {
            reject(new Error('Failed to decode SVG.'));
        };

        img.src = url;
    });
}