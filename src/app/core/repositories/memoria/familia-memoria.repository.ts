import { Injectable } from '@angular/core';
import { Familia } from '../../models/familia';
import { FamiliaRepository } from '../familia.repository';

/** Repositório em memória, usado em testes e no modo de demonstração. */
@Injectable()
export class FamiliaMemoriaRepository extends FamiliaRepository {
  private readonly familias = new Map<string, Familia>();

  async buscarPorCpf(cpf: string): Promise<Familia | undefined> {
    const familia = this.familias.get(cpf);
    return familia ? { ...familia } : undefined;
  }

  async salvar(familia: Familia): Promise<void> {
    this.familias.set(familia.cpfResponsavel, { ...familia });
  }

  async listarTodas(): Promise<Familia[]> {
    return [...this.familias.values()].map((f) => ({ ...f }));
  }
}
