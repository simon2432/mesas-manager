import { useWindowDimensions } from "react-native";

/**
 * Ancho mínimo objetivo por card según el ancho útil del contenedor.
 * En pantallas angostas baja el umbral para permitir más columnas y cards más chicas.
 */
export function minCardTargetForContent(maxContent: number): number {
  if (maxContent < 340) return 86;
  if (maxContent < 400) return 96;
  if (maxContent < 520) return 108;
  if (maxContent < 680) return 132;
  if (maxContent < 900) return 158;
  return 172;
}

export function useMesasCardGridLayout(): {
  cardWidth: number;
  contentWidth: number;
  horizontalPad: number;
  gap: number;
} {
  const { width } = useWindowDimensions();
  const horizontalPad = 16;
  const maxContent = Math.min(width - horizontalPad * 2, 1200);
  const gap = maxContent < 400 ? 8 : 12;
  const minCard = minCardTargetForContent(maxContent);
  let cols = Math.floor((maxContent + gap) / (minCard + gap));
  cols = Math.max(1, Math.min(4, cols));
  const cardWidth = (maxContent - gap * (cols - 1)) / cols;
  return { cardWidth, contentWidth: maxContent, horizontalPad, gap };
}
