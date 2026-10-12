import { Familia } from '../models/familia';
import { Usuario } from '../models/usuario';
import { FamiliaRepository } from '../repositories/familia.repository';
import { EntregaDemoRepository } from './entrega-demo.repository';
import { nomeParaBusca } from '../validators/cpf';
import { mesDeReferencia } from '../services/entrega.service';

/** Usuária fictícia usada no modo demonstração. */
export const USUARIO_DEMO: Usuario = {
  uid: 'demo-ana',
  nome: 'Ana Lima',
  email: 'ana.lima@exemplo.org',
  papel: 'voluntario',
  ativo: true,
};


function familia(cpf: string, nome: string, numMoradores: number, status: Familia['status'] = 'ativa'): Familia {
  const hoje = new Date();
  return {
    cpfResponsavel: cpf,
    nomeResponsavel: nome,
    nomeBusca: nomeParaBusca(nome),
    endereco: 'Quadra 104 – Recanto das Emas',
    numMoradores,
    status,
    dataCadastro: hoje,
    dataAtualizacao: hoje,
    cadastradoPor: 'demo-admin',
  };
}

/** Carrega famílias e entregas fictícias (CPFs de teste válidos, sem dados reais). */
export async function carregarDadosDemo(
  familias: FamiliaRepository,
  entregas: EntregaDemoRepository,
  hoje = new Date(),
): Promise<void> {
  const as = (h: number, m: number) => new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), h, m);
  const lista = [
    familia('52998224725', 'Maria Souza', 4),
    familia('11144477735', 'Maria Souza Ramos', 3),
    familia('93541134780', 'José Pereira', 5),
    familia('12345678909', 'Joana Martins', 3),
    familia('39053344705', 'Francisco Alves', 6),
    familia('15350946056', 'Antônia Ribeiro', 2, 'espera'),
  ];
  for (const f of lista) {
    await familias.salvar(f);
  }
  const mes = mesDeReferencia(hoje);
  await entregas.criar({
    id: `11144477735_${mes}`, familiaCpf: '11144477735', nomeResponsavel: 'Maria Souza Ramos',
    mesReferencia: mes, dataHoraEntrega: as(8, 40), registradoPor: 'demo-ana',
  });
  await entregas.criar({
    id: `12345678909_${mes}`, familiaCpf: '12345678909', nomeResponsavel: 'Joana Martins',
    mesReferencia: mes, dataHoraEntrega: as(8, 21), registradoPor: 'demo-carlos',
  });
  // Entrega feita por outro voluntário que este aparelho ainda não sincronizou.
  entregas.registrarEmOutroAparelho({
    id: `93541134780_${mes}`, familiaCpf: '93541134780', nomeResponsavel: 'José Pereira',
    mesReferencia: mes, dataHoraEntrega: as(8, 55), registradoPor: 'Carlos Melo',
  });
}
