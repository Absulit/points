const template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        .output{
            color: #00fd30;
            position: absolute;
            bottom: 0px;
            margin: 0 0 0 1em;
        }
    </style>
    <div id='output' class="output">
        Open JS Console
    </div>
`;

export default class OutputLog extends HTMLElement {
    #mainEl = null;
    #outputEl = null;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.#mainEl = template.content.cloneNode(true);
        this.#outputEl = this.#mainEl.querySelector('#output');
        this.shadowRoot.append(this.#mainEl);
    }

    /**
     * @param {string} val
     */
    set text(val) {
        this.#outputEl.innerText = val;
    }

    get text(){
        return this.#outputEl.innerText;
    }
}

customElements.define('output-log', OutputLog);
