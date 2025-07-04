export class Grid {
  constructor(width = 1000, height = 500, step = 100) {
    this.width = width;
    this.height = height;
    this.step = step;
  }

  draw(axesBg, axesGroup, labelsOffset = 0) {
    axesGroup.innerHTML = "";
    axesBg.innerHTML = "";

    // Сетка
    for (let x = 0; x <= this.width; x += this.step) {
      axesBg.innerHTML += `
        <line
          x1="${x}"
          y1="0"
          x2="${x}"
          y2="${this.height}"
          stroke="#888" stroke-width="1"/>
      `;
    }
    for (let y = 0; y <= this.height; y += this.step) {
      if (y === 0) continue;
      axesBg.innerHTML += `
        <line
          x1="0"
          y1="${this.height - y}"
          x2="${this.width}"
          y2="${this.height - y}"
          stroke="#888"
          stroke-width="1"/>
      `;
    }

    // Фон под X
    axesGroup.innerHTML += `
      <rect x="0"
        y="${this.height - 25}"
        width="${this.width}"
        height="25"
        fill="#666666"
      />
    `;
    // Фон под Y
    axesGroup.innerHTML += `
      <rect
        x="0"
        y="0"
        width="30"
        height="${this.height}"
        fill="#666666"
      />
    `;

    // Подписи X (кроме 0)
    for (let x = this.step; x <= this.width; x += this.step) {
      axesGroup.innerHTML += `
        <rect
          x="${x - 18}"
          y="${this.height - 25}"
          width="36"
          height="22"
          fill="#666666"
          rx="4"
          ry="4"
        />
        <text
          x="${x}"
          y="${this.height - 10}"
          font-size="18"
          fill="#000"
          text-anchor="middle"
          alignment-baseline="middle"
        >${x / 10 + labelsOffset}</text>
      `;
    }

    // Подписи Y (кроме 0)
    for (let y = this.step; y <= this.height; y += this.step) {
      axesGroup.innerHTML += `
        <rect
          x="0"
          y="${this.height - y - 18}"
          width="30"
          height="22"
          fill="#666666"
          rx="4"
          ry="4"
        />
        <text
          x="3"
          y="${this.height - y - 1}"
          font-size="18"
          fill="#000"
          alignment-baseline="middle"
        >${y / 10 + labelsOffset}</text>
      `;
    }

    // Статичный "0"
    axesGroup.innerHTML += `
      <rect
        x="0"
        y="${this.height - 30}"
        width="30"
        height="22"
        fill="#666666"
        rx="4"
        ry="4"
      />
      <text
        x="8"
        y="${this.height - 12}"
        font-size="18"
        fill="#000"
        alignment-baseline="middle"
      >${labelsOffset}</text>
    `;
  }
}
