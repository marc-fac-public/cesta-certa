import { Injectable, inject } from '@angular/core';
import { Entrega } from '../models/entrega';
import { Familia } from '../models/familia';
import { EntregaJaExisteError, EntregaRepository } from '../repositories/entrega.repository';
import { FamiliaRepository } from '../repositories/familia.repository';
import { normalizarCpf } from '../validators/cpf';

export type ResultadoEntrega =
  | { ok: true; entrega: Entrega }
  | { ok: false; motivo: 'ja-entregue'; existente: Entrega }
  | { ok: false; motivo: 'familia-nao-ativa' | 'familia-nao-encontrada' };

export interface ItemListaDoMes {
  familia: Familia;
  entrega?: Entrega;
}

/** Mês de referência no formato AAAA-MM. */
export function mesDeReferencia(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

/** Identificador da entrega: CPF da família + mês. Garante uma única entrega por mês. */
export function idEntrega(cpf: string, mesReferencia: string): string {
  return `${cpf}_${mesReferencia}`;
}

/** Regras de negócio da entrega de cestas (RF06, RF07, RF08 e RF09). */
@Injectable({ providedIn: 'root' })
export class EntregaService {
  private readonly familias = inject(FamiliaRepository);
  private readonly entregas = inject(EntregaRepository);

  async registrar(cpfInformado: string, usuarioUid: string, agora = new Date()): Promise<ResultadoEntrega> {
    // O identificador da entrega deve usar sempre os 11 dígitos, com ou sem pontuação na entrada.
    const cpf = normalizarCpf(cpfInformado);
    const familia = await this.familias.buscarPorCpf(cpf);
    if (!familia) {
      return { ok: false, motivo: 'familia-nao-encontrada' };
    }
    if (familia.status !== 'ativa') {
      return { ok: false, motivo: 'familia-nao-ativa' };
    }

    const mes = mesDeReferencia(agora);
    const id = idEntrega(cpf, mes);
    const anterior = await this.entregas.buscarPorId(id);
    if (anterior) {
      return { ok: false, motivo: 'ja-entregue', existente: anterior };
    }

    const entrega: Entrega = {
      id,
      familiaCpf: cpf,
      nomeResponsavel: familia.nomeResponsavel,
      mesReferencia: mes,
      dataHoraEntrega: agora,
      registradoPor: usuarioUid,
    };
    try {
      await this.entregas.criar(entrega);
    } catch (erro) {
      // Outro aparelho registrou a mesma família antes: a regra do repositório recusa a segunda gravação.
      if (erro instanceof EntregaJaExisteError) {
        return { ok: false, motivo: 'ja-entregue', existente: erro.existente };
      }
      throw erro;
    }
    return { ok: true, entrega };
  }

  /** Famílias ativas do mês, com a entrega quando já houver (RF06). */
  async listaDoMes(mesReferencia: string): Promise<ItemListaDoMes[]> {
    const [familias, entregas] = await Promise.all([
      this.familias.listarTodas(),
      this.entregas.listarPorMes(mesReferencia),
    ]);
    const porCpf = new Map(entregas.map((e) => [e.familiaCpf, e]));
    return familias
      .filter((f) => f.status === 'ativa')
      .sort((a, b) => a.nomeResponsavel.localeCompare(b.nomeResponsavel, 'pt-BR'))
      .map((familia) => ({ familia, entrega: porCpf.get(familia.cpfResponsavel) }));
  }

  /** Famílias ativas que não retiraram a cesta no mês (RF09). */
  async naoCompareceram(mesReferencia: string): Promise<Familia[]> {
    return (await this.listaDoMes(mesReferencia)).filter((item) => !item.entrega).map((item) => item.familia);
  }
}
