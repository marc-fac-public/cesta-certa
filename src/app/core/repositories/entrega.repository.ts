import { Entrega } from '../models/entrega';

/** Erro lançado quando já existe uma entrega com o mesmo identificador (CPF + mês). */
export class EntregaJaExisteError extends Error {
  constructor(readonly existente: Entrega) {
    super(`Entrega ${existente.id} já registrada.`);
    this.name = 'EntregaJaExisteError';
  }
}

/**
 * Único ponto de acesso aos dados de entregas.
 * `criar` nunca sobrescreve: se o identificador já existir, lança EntregaJaExisteError,
 * espelhando a regra de segurança do Firestore que permite criar, mas não alterar.
 */
export abstract class EntregaRepository {
  abstract buscarPorId(id: string): Promise<Entrega | undefined>;
  abstract criar(entrega: Entrega): Promise<void>;
  abstract listarPorMes(mesReferencia: string): Promise<Entrega[]>;
}
