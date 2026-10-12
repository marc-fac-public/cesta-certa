import { Familia } from '../models/familia';

/**
 * Único ponto de acesso aos dados de famílias.
 * A implementação em produção usará o Cloud Firestore; os testes usam a versão em memória.
 */
export abstract class FamiliaRepository {
  abstract buscarPorCpf(cpf: string): Promise<Familia | undefined>;
  abstract salvar(familia: Familia): Promise<void>;
  abstract listarTodas(): Promise<Familia[]>;
}
