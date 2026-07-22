/** Presets de data da busca admin (estilo Drive). */
export const modifiedAfterFromPreset = (preset: string): string | undefined => {
  if (!preset || preset === 'any') return undefined;
  const now = new Date();
  const start = new Date(now);
  if (preset === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (preset === '7d') {
    start.setDate(start.getDate() - 7);
  } else if (preset === '30d') {
    start.setDate(start.getDate() - 30);
  } else if (preset === 'year') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    return undefined;
  }
  return start.toISOString();
};
