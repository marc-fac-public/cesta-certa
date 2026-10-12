/** Registro da retirada de uma cesta. Só existe uma entrega por família por mês. */
export interface Entrega {
  /** CPF da família + mês de referência, por exemplo 12345678909_2026-11. */
  id: string;
  familiaCpf: string;
  nomeResponsavel: string;
  /** Mês no formato AAAA-MM. */
  mesReferencia: string;
  dataHoraEntrega: Date;
  registradoPor: string;
}
