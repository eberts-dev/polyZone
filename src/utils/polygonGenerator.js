import { getRandomColor } from "./randomColor.js";

// Генерация массива случайных полигонов
export function generateRandomPolygonData(count) {
  const polygons = [];
  for (let i = 0; i < count; i++) {
    const points = generateRandomPolygonPoints();
    const fill = getRandomColor();
    const width = "100";
    const height = "100";
    const viewBox = "0 0 100 100";
    polygons.push({ points, fill, width, height, viewBox });
  }
  return polygons;
}

export function generateRandomPolygonPoints() {
  const vertexCount = Math.floor(Math.random() * 5) + 3;
  const centerX = 50;
  const centerY = 50;
  const baseRadius = 40;
  const points = [];
  let angles = [];
  let currentAngle = 0;
  for (let i = 0; i < vertexCount; i++) {
    const angleStep = (Math.random() * 0.8 + 0.1) * (Math.PI / 2);
    currentAngle += angleStep;
    angles.push(currentAngle);
  }
  const totalAngle = angles[angles.length - 1];
  const scale = (Math.PI * 2) / totalAngle;
  angles = angles.map((a) => a * scale);
  for (let i = 0; i < vertexCount; i++) {
    let radius = baseRadius;
    const isSharpAngle = Math.random() > 0.8;
    if (isSharpAngle) {
      radius *= 0.2 + Math.random() * 0.3;
    } else {
      radius *= 0.7 + Math.random() * 0.6;
    }
    const x = centerX + radius * Math.cos(angles[i]);
    const y = centerY + radius * Math.sin(angles[i]);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
}
