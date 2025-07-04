import { Grid } from "./Grid.js";

export class WorkZone extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.droppedPolygons = [];
    this.scale = 1;
    this.offset = { x: 0, y: 0 };
    this.panStart = { x: 0, y: 0 };
    this.labelsOffset = 0; // смещение для подписей
  }

  connectedCallback() {
    this.render();
    this.setupAxes();
    this.setupZoomAndPan();
    this.setupDropZone();
    document.addEventListener("reset-polygons", () => this.resetWorkZone());
  }

  // функция для отрисовки сетки
  setupAxes() {
    this.gridDrawer = new Grid();
    this.gridDrawer.draw(
      this.shadowRoot.querySelector(".axes-bg g#axes-bg"),
      this.shadowRoot.querySelector(".axes g#axes-group")
    );
  }

  //для перетаскивания svg
  makeDraggable(svg) {
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    svg.setAttribute("draggable", "false");
    svg.addEventListener("dragstart", (e) => e.preventDefault());
    svg.style.position = "absolute";
    svg.style.cursor = "grab";

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dropAreaRect = this.shadowRoot
        .getElementById("drop-area")
        .getBoundingClientRect();

      let newLeft = (e.clientX - dropAreaRect.left - offset.x) / this.scale;
      let newTop = (e.clientY - dropAreaRect.top - offset.y) / this.scale;

      svg.style.left = `${newLeft}px`;
      svg.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        svg.style.cursor = "grab";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      }
    };

    svg.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      isDragging = true;
      offset.x = e.clientX - svg.getBoundingClientRect().left;
      offset.y = e.clientY - svg.getBoundingClientRect().top;
      svg.style.cursor = "grabbing";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });
  }

  //для масштабирования и перемещения
  applyTransform() {
    const axesBg = this.shadowRoot.getElementById("axes-bg");
    axesBg.setAttribute("transform", `scale(${this.scale})`);

    // Перемещение drop-area
    const dropArea = this.shadowRoot.getElementById("drop-area");
    dropArea.style.transform = `translate(${this.offset.x}px,${this.offset.y}px) scale(${this.scale})`;
    dropArea.style.transformOrigin = "0 0";

    // Перерисовка сетки/подписей при каждом изменении масштаба
    if (this.gridDrawer) {
      this.gridDrawer.draw(
        this.shadowRoot.querySelector(".axes-bg g#axes-bg"),
        this.shadowRoot.querySelector(".axes g#axes-group"),
        this.labelsOffset
      );
    }
  }

  //для масштаба и панели сдвига
  setupZoomAndPan() {
    const viewport = this.shadowRoot.getElementById("viewport");

    viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const prevScale = this.scale;
      this.scale *= e.deltaY < 0 ? 1.1 : 0.9;

      // масштабы min max
      if (this.scale < 1) this.scale = 1;
      if (this.scale > 5) this.scale = 5;

      // Изменяем шкалу только при увеличении
      if (e.deltaY < 0 && this.labelsOffset < 100) {
        this.labelsOffset += 10;
      } else if (e.deltaY > 0 && this.labelsOffset > 0) {
        this.labelsOffset -= 10;
      }

      // Центрируем относительно курсора
      const rect = viewport.getBoundingClientRect();
      const mx = e.clientX - rect.left - this.offset.x;
      const my = e.clientY - rect.top - this.offset.y;
      this.offset.x -= mx * (this.scale / prevScale - 1);
      this.offset.y -= my * (this.scale / prevScale - 1);
      this.applyTransform();
    });

    viewport.addEventListener("mousedown", (e) => {
      if (e.target.closest("svg") && e.target !== viewport) return;
      if (e.button !== 0) return;
      this.isPanning = true;
      this.panStart = {
        x: e.clientX - this.offset.x,
        y: e.clientY - this.offset.y,
      };
      viewport.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isPanning) return;
      this.offset.x = e.clientX - this.panStart.x;
      this.offset.y = e.clientY - this.panStart.y;

      // Оси всегда видны
      if (this.offset.x > 0) this.offset.x = 0;
      if (this.offset.y > 0) this.offset.y = 0;
      this.applyTransform();
    });

    window.addEventListener("mouseup", () => {
      this.isPanning = false;
      viewport.style.cursor = "grab";
    });
  }

  //drag&drop в рабочую область
  setupDropZone() {
    this.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });

    // Обработчик drop
    this.addEventListener("drop", (e) => {
      e.preventDefault();
      const dropArea = this.shadowRoot.getElementById("drop-area");

      // Разные форматы данных
      let svgString =
        e.dataTransfer.getData("text/html") ||
        e.dataTransfer.getData("text/plain");

      if (!svgString) {
        console.error("Изображение SVG не найдено");
        return;
      }

      // Парсинг и клонирование SVG
      try {
        const parser = new DOMParser();
        let svg =
          parser.parseFromString(svgString, "text/html").querySelector("svg") ||
          parser
            .parseFromString(svgString, "image/svg+xml")
            .querySelector("svg");

        if (!svg) throw new Error("Невозможно распарсить SVG");

        // Настройка позиционирования
        const rect = dropArea.getBoundingClientRect();
        let left = (e.clientX - rect.left) / this.scale;
        let top = (e.clientY - rect.top) / this.scale;
        svg.style.position = "absolute";
        svg.style.left = `${left}px`;
        svg.style.top = `${top}px`;
        svg.style.pointerEvents = "auto";
        svg.setAttribute("draggable", "false");

        // Добавляем в DOM
        dropArea.appendChild(svg);
        this.droppedPolygons.push(svg);
        this.makeDraggable(svg);
      } catch (error) {
        console.error("Не удалось распарсить SVG:", error);
      }
    });
  }

  resetWorkZone() {
    const dropArea = this.shadowRoot.getElementById("drop-area");
    if (dropArea) dropArea.innerHTML = "";
    this.droppedPolygons = [];
  }

  render() {
    this.shadowRoot.innerHTML = `
       <style>
        .work-zone { position: relative; width: 100%; height: 500px; background: #323232; overflow: hidden; }
        .axes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2; }
        .axes text { fill: #000 !important; }
        .axes, .axes * { user-select: none; }
        .viewport { width: 950px; height: 475px; position: absolute; top: 0; left: 0; z-index: 1; cursor: grab; }
        .viewport:active { cursor: grabbing; }
        .axes-bg { z-index: 0; }
        .drop-area { position: absolute; top: 0; left: 0; width: 950px; height: 475px; z-index: 1; }
        .drop-area svg {z-index: 10; position: absolute; pointer-events: auto;}
      </style>
      <div class="work-zone">
        <svg class="axes-bg" width="100%" height="500">
          <g id="axes-bg"></g>
        </svg>
        <div class="viewport" id="viewport">
          <div class="drop-area" id="drop-area"></div>
        </div>
        <svg class="axes" width="1000" height="1000">
          <g id="axes-group"></g>
        </svg>
      </div>
    `;
  }
}

customElements.define("work-zone", WorkZone);
