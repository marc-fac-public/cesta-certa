/** Hora no formato usado nas telas: 9h12. */
export function formatarHora(data: Date): string {
  return `${data.getHours()}h${String(data.getMinutes()).padStart(2, '0')}`;
}

/** Nomes fictícios dos voluntários do modo demonstração. */
const NOMES_DEMO: Record<string, string> = { 'demo-ana': 'Ana Lima', 'demo-carlos': 'Carlos Melo', 'demo-admin': 'Augusto' };

export function nomeDoVoluntario(uid: string): string {
  return NOMES_DEMO[uid] ?? uid;
}
