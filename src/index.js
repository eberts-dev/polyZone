import "./components/AppLayout.js";
import "./components/BufferZone.js";
import "./components/ControlPanel.js";
import "./components/WorkZone.js";

// Инициализация приложения
document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector("div");
  app.innerHTML = `
    <app-layout>
      <control-panel></control-panel>
      <buffer-zone></buffer-zone>
      <work-zone></work-zone>
    </app-layout>
  `;

  document.body.appendChild(app);
});
