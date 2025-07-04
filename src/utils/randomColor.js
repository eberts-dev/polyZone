// для генерации случайного цвета в формате hsl
export function getRandomColor() {
  return `hsl(${Math.random() * 360}, 70%, 80%)`;
}
