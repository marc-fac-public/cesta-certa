/** Situação da família no programa de distribuição. */
export type StatusFamilia = 'ativa' | 'espera' | 'inativa';

/** Família atendida pela associação. O CPF do responsável é o identificador único. */
export interface Familia {
  cpfResponsavel: string;
  nomeResponsavel: string;
  /** Nome em minúsculas e sem acentos, usado na busca por parte do nome. */
  nomeBusca: string;
  endereco: string;
  telefone?: string;
  numMoradores: number;
  status: StatusFamilia;
  dataCadastro: Date;
  dataAtualizacao: Date;
  cadastradoPor: string;
}

/** Dados informados no formulário de cadastro. */
export interface NovaFamilia {
  cpfResponsavel: string;
  nomeResponsavel: string;
  endereco: string;
  telefone?: string;
  numMoradores: number;
  status: Extract<StatusFamilia, 'ativa' | 'espera'>;
}
