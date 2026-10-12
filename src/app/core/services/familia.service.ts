import { Injectable, inject } from '@angular/core';
import { Familia, NovaFamilia } from '../models/familia';
import { FamiliaRepository } from '../repositories/familia.repository';
import { cpfValido, nomeParaBusca, normalizarCpf } from '../validators/cpf';

export type ResultadoCadastro =
  | { ok: true; familia: Familia }
  | { ok: false; motivo: 'dados-invalidos'; erros: Record<string, string> }
  | { ok: false; motivo: 'cpf-duplicado'; existente: Familia };

const TAMANHO_MAXIMO_TEXTO = 120;
const CARACTERES_PROIBIDOS = /[<>]/;

/** Regras de negócio do cadastro de famílias (RF02, RF03 e RF05). */
@Injectable({ providedIn: 'root' })
export class FamiliaService {
  private readonly repositorio = inject(FamiliaRepository);

  async cadastrar(dados: NovaFamilia, usuarioUid: string, agora = new Date()): Promise<ResultadoCadastro> {
    const erros = this.validar(dados);
    if (Object.keys(erros).length > 0) {
      return { ok: false, motivo: 'dados-invalidos', erros };
    }

    const cpf = normalizarCpf(dados.cpfResponsavel);
    const existente = await this.repositorio.buscarPorCpf(cpf);
    if (existente) {
      return { ok: false, motivo: 'cpf-duplicado', existente };
    }

    const familia: Familia = {
      cpfResponsavel: cpf,
      nomeResponsavel: dados.nomeResponsavel.trim(),
      nomeBusca: nomeParaBusca(dados.nomeResponsavel),
      endereco: dados.endereco.trim(),
      telefone: dados.telefone?.trim() || undefined,
      numMoradores: dados.numMoradores,
      status: dados.status,
      dataCadastro: agora,
      dataAtualizacao: agora,
      cadastradoPor: usuarioUid,
    };
    await this.repositorio.salvar(familia);
    return { ok: true, familia };
  }

  /** Busca por parte do nome (sem acentos) ou do CPF, a partir de 3 caracteres. */
  async buscar(termo: string): Promise<Familia[]> {
    const texto = nomeParaBusca(termo);
    if (texto.length < 3) {
      return [];
    }
    const digitos = normalizarCpf(termo);
    const familias = await this.repositorio.listarTodas();
    return familias.filter(
      (f) => f.nomeBusca.includes(texto) || (digitos.length >= 3 && f.cpfResponsavel.includes(digitos)),
    );
  }

  private validar(dados: NovaFamilia): Record<string, string> {
    const erros: Record<string, string> = {};
    if (!cpfValido(dados.cpfResponsavel)) {
      erros['cpfResponsavel'] = 'CPF inválido: confira os 11 números.';
    }
    if (!dados.nomeResponsavel?.trim()) {
      erros['nomeResponsavel'] = 'Informe o nome do responsável.';
    } else if (dados.nomeResponsavel.length > TAMANHO_MAXIMO_TEXTO || CARACTERES_PROIBIDOS.test(dados.nomeResponsavel)) {
      erros['nomeResponsavel'] = 'Nome com caracteres não permitidos ou longo demais.';
    }
    if (!dados.endereco?.trim()) {
      erros['endereco'] = 'Informe o endereço.';
    } else if (dados.endereco.length > TAMANHO_MAXIMO_TEXTO || CARACTERES_PROIBIDOS.test(dados.endereco)) {
      erros['endereco'] = 'Endereço com caracteres não permitidos ou longo demais.';
    }
    if (!Number.isInteger(dados.numMoradores) || dados.numMoradores < 1) {
      erros['numMoradores'] = 'O número de moradores deve ser 1 ou mais.';
    }
    return erros;
  }
}
