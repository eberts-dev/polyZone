export class ControlPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupButtons();
  }

  setupButtons() {
    setTimeout(() => {
      const buttons = [
        {
          id: "create-btn",
          event: "create-polygons",
          detail: () => ({ count: Math.floor(Math.random() * 16) + 5 }),
        },
        {
          id: "save-btn",
          event: "save-polygons",
        },
        {
          id: "reset-btn",
          event: "reset-polygons",
          before: () => localStorage.removeItem("polygons"),
        },
      ];

      buttons.forEach(({ id, event, detail, before }) => {
        const btn = this.shadowRoot.getElementById(id);
        if (!btn) return;
        btn.addEventListener("click", () => {
          if (before) before();
          const customEvent = new CustomEvent(event, {
            ...(detail ? { detail: detail() } : {}),
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(customEvent);
        });
      });
    }, 0);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .control-panel {
          display: flex;
          justify-content: space-between;
          padding: 20px;
          background-color: #323232;
          margin-bottom: 10px;
        }
        .btn-group {
          display: flex;
          gap: 10px;
        }
        button {
          padding: 8px 16px;
          border-radius: 4px;
          background: #989898;
          border: none;
          cursor: pointer;
          color: black;
        }
      </style>
      <div class="control-panel">
        <button id="create-btn">Создать</button>
        <div class="btn-group">
          <button id="save-btn">Сохранить</button>
          <button id="reset-btn">Сбросить</button>
        </div>
      </div>
    `;
  }
}

customElements.define("control-panel", ControlPanel);
