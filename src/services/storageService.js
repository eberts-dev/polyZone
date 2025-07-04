// Сервис для работы с localStorage для полигонов
export function savePolygons(polygons) {
  localStorage.setItem("polygons", JSON.stringify(polygons)); // сохраняем полигоны в localStorage
}

export function getPolygons() {
  const saved = localStorage.getItem("polygons");
  if (!saved) return []; // нет сохраненных полигонов, возвращаем пустой массив
  try {
    const polygons = JSON.parse(saved);
    return Array.isArray(polygons) ? polygons : []; // проверяем, что polygons - массив
  } catch {
    return [];
  }
}

export function clearPolygons() {
  localStorage.removeItem("polygons");
}
