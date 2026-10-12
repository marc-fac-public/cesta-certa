import { TestBed } from '@angular/core/testing';
import { EntregaRepository } from '../repositories/entrega.repository';
import { FamiliaRepository } from '../repositories/familia.repository';
import { EntregaMemoriaRepository } from '../repositories/memoria/entrega-memoria.repository';
import { FamiliaMemoriaRepository } from '../repositories/memoria/familia-memoria.repository';
import { EntregaService } from '../services/entrega.service';
import { FamiliaService } from '../services/familia.service';

/**
 * Teste de integração: serviços de família e de entrega trabalhando juntos
 * sobre os mesmos repositórios, reproduzindo o sábado de distribuição.
 */
describe('Integração: fluxo do sábado de entrega', () => {
  let familias: FamiliaService;
  let entregas: EntregaService;
  const sabado = (h: number, m: number) => new Date(2026, 10, 7, h, m);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FamiliaRepository, useClass: FamiliaMemoriaRepository },
        { provide: EntregaRepository, useClass: EntregaMemoriaRepository },
      ],
    });
    familias = TestBed.inject(FamiliaService);
    entregas = TestBed.inject(EntregaService);

    const base = { endereco: 'Quadra 104', numMoradores: 4 };
    await familias.cadastrar({ ...base, cpfResponsavel: '529.982.247-25', nomeResponsavel: 'Maria Souza', status: 'ativa' }, 'uid-admin');
    await familias.cadastrar({ ...base, cpfResponsavel: '111.444.777-35', nomeResponsavel: 'José Pereira', status: 'ativa' }, 'uid-admin');
    await familias.cadastrar({ ...base, cpfResponsavel: '123.456.789-09', nomeResponsavel: 'Joana Martins', status: 'ativa' }, 'uid-admin');
    await familias.cadastrar({ ...base, cpfResponsavel: '935.411.347-80', nomeResponsavel: 'Antônia Ribeiro', status: 'espera' }, 'uid-admin');
  });

  it('busca, registra, bloqueia duplicidade e calcula quem não compareceu', async () => {
    // Lista do mês: só as famílias ativas, todas pendentes.
    const inicio = await entregas.listaDoMes('2026-11');
    expect(inicio.map((i) => i.familia.nomeResponsavel)).toEqual(['Joana Martins', 'José Pereira', 'Maria Souza']);
    expect(inicio.every((i) => !i.entrega)).toBe(true);

    // A voluntária busca por parte do nome e registra a entrega.
    const [maria] = await familias.buscar('maria sou');
    expect((await entregas.registrar(maria.cpfResponsavel, 'uid-ana', sabado(9, 12))).ok).toBe(true);

    // Outro voluntário já tinha entregue a cesta de José; uma segunda tentativa é bloqueada.
    expect((await entregas.registrar('11144477735', 'uid-carlos', sabado(8, 55))).ok).toBe(true);
    const duplicada = await entregas.registrar('11144477735', 'uid-ana', sabado(9, 15));
    expect(duplicada.ok).toBe(false);

    // Situação final do mês.
    const fim = await entregas.listaDoMes('2026-11');
    expect(fim.filter((i) => i.entrega)).toHaveLength(2);
    expect((await entregas.naoCompareceram('2026-11')).map((f) => f.nomeResponsavel)).toEqual(['Joana Martins']);
  });

  it('não permite cadastrar de novo uma família que já recebe cesta', async () => {
    const repetida = await familias.cadastrar(
      { cpfResponsavel: '52998224725', nomeResponsavel: 'Maria Souza', endereco: 'Outra rua', numMoradores: 2, status: 'ativa' },
      'uid-ana',
    );
    expect(repetida.ok).toBe(false);
    expect(await entregas.listaDoMes('2026-11')).toHaveLength(3);
  });
});
