import { Injectable } from '@angular/core';
import { Entrega } from '../../models/entrega';
import { EntregaJaExisteError, EntregaRepository } from '../entrega.repository';

/** Repositório em memória, usado em testes e no modo de demonstração. */
@Injectable()
export class EntregaMemoriaRepository extends EntregaRepository {
  private readonly entregas = new Map<string, Entrega>();

  async buscarPorId(id: string): Promise<Entrega | undefined> {
    const entrega = this.entregas.get(id);
    return entrega ? { ...entrega } : undefined;
  }

  async criar(entrega: Entrega): Promise<void> {
    const existente = this.entregas.get(entrega.id);
    if (existente) {
      throw new EntregaJaExisteError({ ...existente });
    }
    this.entregas.set(entrega.id, { ...entrega });
  }

  async listarPorMes(mesReferencia: string): Promise<Entrega[]> {
    return [...this.entregas.values()].filter((e) => e.mesReferencia === mesReferencia).map((e) => ({ ...e }));
  }
}
