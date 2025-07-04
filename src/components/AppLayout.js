export class AppLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 980px;
          width: 100%;
          margin: 0 auto;
          background-color: #ccc;
        }
      </style>
      <control-panel></control-panel>
      <buffer-zone></buffer-zone>
      <work-zone></work-zone>
    `;
  }
}

customElements.define("app-layout", AppLayout);
