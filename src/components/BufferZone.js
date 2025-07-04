import {
  clearPolygons,
  getPolygons,
  savePolygons,
} from "../services/storageService.js";
import { generateRandomPolygonData } from "../utils/polygonGenerator.js";

export class BufferZone extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.polygonData = [];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.restoreFromStorage();
  }

  restoreFromStorage() {
    this.polygonData = getPolygons();
    this.renderPolygons();
    this.isDirty = false;
  }

  renderPolygons() {
    const container = this.shadowRoot.getElementById("shapes-container");
    container.innerHTML = "";
    for (const data of this.polygonData) {
      const svg = this.createPolygonElement(data.points, data.fill, {
        width: data.width,
        height: data.height,
        viewBox: data.viewBox,
      });
      container.appendChild(svg);
    }
  }

  setupEventListeners() {
    document.addEventListener("create-polygons", (e) => {
      this.polygonData = generateRandomPolygonData(e.detail.count);
      this.renderPolygons();
      this.isDirty = true;
    });
    document.addEventListener("save-polygons", () => {
      savePolygons(this.polygonData);
      this.isDirty = false;
    });
    document.addEventListener("reset-polygons", () => {
      clearPolygons();
      this.polygonData = [];
      this.renderPolygons();
      this.isDirty = false;
    });
  }

  // Создаем SVG-элемент полигона
  createPolygonElement(points, fill, attributes = {}) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", attributes.width || "100");
    svg.setAttribute("height", attributes.height || "100");
    svg.setAttribute("viewBox", attributes.viewBox || "0 0 100 100");
    svg.setAttribute("class", "polygon");
    svg.setAttribute("draggable", "true");
    svg.style.userDrag = "element";
    svg.style.webkitUserDrag = "element";

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", fill);
    polygon.setAttribute("stroke", "#333");
    polygon.setAttribute("stroke-miterlimit", "2");
    svg.appendChild(polygon);

    // образ полигона
    svg.addEventListener("dragstart", (e) => {
      const svgString = new XMLSerializer().serializeToString(svg);
      e.dataTransfer.setData("text/html", svgString);
      e.dataTransfer.setData("text/plain", svgString);
      e.dataTransfer.setDragImage(svg, 50, 50);
    });
    return svg;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .buffer-zone {
          margin-bottom: 10px;
          min-height: 200px;
          background-color: #323232;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-content: flex-start;
        }
        .polygon {
          cursor: grab;
          transition: transform 0.1s;
          margin: 10px;
        }
        .polygon:active {
          cursor: grabbing;
          transform: scale(0.95);
        }
      </style>
      <div class="buffer-zone">
        <div id="shapes-container"></div>
      </div>
    `;
  }
}

customElements.define("buffer-zone", BufferZone);
