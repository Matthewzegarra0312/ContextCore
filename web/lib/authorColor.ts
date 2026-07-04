const SERIES_SLOTS = 8;

// Asignación categórica fija por autor (hash simple, determinístico) — nunca
// se re-asignan colores al filtrar, para que la identidad de cada dev no
// "salte" de color entre renders (ver dataviz: "color follows the entity").
export function authorColorVar(author: string): string {
  let hash = 0;
  for (let i = 0; i < author.length; i++) {
    hash = (hash * 31 + author.charCodeAt(i)) >>> 0;
  }
  const slot = (hash % SERIES_SLOTS) + 1;
  return `var(--series-${slot})`;
}

export function authorInitial(author: string): string {
  return author.charAt(0).toUpperCase();
}
