import { Injectable } from '@angular/core';
import { Entrega } from '../models/entrega';
import { EntregaJaExisteError } from '../repositories/entrega.repository';
import { EntregaMemoriaRepository } from '../repositories/memoria/entrega-memoria.repository';

/**
 * Repositório de demonstração que simula o comportamento offline do Firestore:
 * as entregas feitas por outro aparelho ainda não aparecem na lista deste celular,
 * mas o "servidor" recusa uma segunda gravação com o mesmo identificador.
 */
@Injectable()
export class EntregaDemoRepository extends EntregaMemoriaRepository {
  private readonly deOutroAparelho = new Map<string, Entrega>();

  registrarEmOutroAparelho(entrega: Entrega): void {
    this.deOutroAparelho.set(entrega.id, { ...entrega });
  }

  override async criar(entrega: Entrega): Promise<void> {
    const remota = this.deOutroAparelho.get(entrega.id);
    if (remota) {
      this.deOutroAparelho.delete(entrega.id);
      await super.criar(remota); // a sincronização traz a entrega do outro aparelho
      throw new EntregaJaExisteError({ ...remota });
    }
    await super.criar(entrega);
  }
}
