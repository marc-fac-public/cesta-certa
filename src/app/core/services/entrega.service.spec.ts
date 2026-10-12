import { TestBed } from '@angular/core/testing';
import { Entrega } from '../models/entrega';
import { Familia } from '../models/familia';
import { EntregaJaExisteError, EntregaRepository } from '../repositories/entrega.repository';
import { FamiliaRepository } from '../repositories/familia.repository';
import { EntregaMemoriaRepository } from '../repositories/memoria/entrega-memoria.repository';
import { FamiliaMemoriaRepository } from '../repositories/memoria/familia-memoria.repository';
import { EntregaService, idEntrega, mesDeReferencia } from './entrega.service';

const sabado = new Date(2026, 10, 7, 9, 12); // 07/11/2026 às 9h12

function familia(cpf: string, nome: string, status: Familia['status'] = 'ativa'): Familia {
  return {
    cpfResponsavel: cpf,
    nomeResponsavel: nome,
    nomeBusca: nome.toLowerCase(),
    endereco: 'Quadra 104',
    numMoradores: 3,
    status,
    dataCadastro: sabado,
    dataAtualizacao: sabado,
    cadastradoPor: 'uid-admin',
  };
}

describe('EntregaService', () => {
  let servico: EntregaService;
  let familias: FamiliaRepository;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FamiliaRepository, useClass: FamiliaMemoriaRepository },
        { provide: EntregaRepository, useClass: EntregaMemoriaRepository },
      ],
    });
    servico = TestBed.inject(EntregaService);
    familias = TestBed.inject(FamiliaRepository);
    await familias.salvar(familia('52998224725', 'Maria Souza'));
    await familias.salvar(familia('11144477735', 'Antônia Ribeiro', 'espera'));
  });

  it('monta o identificador com CPF e mês de referência', () => {
    expect(mesDeReferencia(sabado)).toBe('2026-11');
    expect(idEntrega('52998224725', '2026-11')).toBe('52998224725_2026-11');
  });

  it('registra a entrega de uma família ativa (RF07)', async () => {
    const resultado = await servico.registrar('52998224725', 'uid-ana', sabado);
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.entrega.id).toBe('52998224725_2026-11');
      expect(resultado.entrega.registradoPor).toBe('uid-ana');
    }
  });

  it('bloqueia a segunda entrega no mesmo mês e informa o horário anterior (RF08)', async () => {
    await servico.registrar('52998224725', 'uid-ana', sabado);
    const segunda = await servico.registrar('52998224725', 'uid-carlos', new Date(2026, 10, 7, 9, 15));
    expect(segunda.ok).toBe(false);
    if (!segunda.ok && segunda.motivo === 'ja-entregue') {
      expect(segunda.existente.dataHoraEntrega).toEqual(sabado);
      expect(segunda.existente.registradoPor).toBe('uid-ana');
    } else {
      throw new Error('esperava motivo ja-entregue');
    }
  });

  it('aceita o CPF com pontuação e gera o mesmo identificador da entrega', async () => {
    const resultado = await servico.registrar('529.982.247-25', 'uid-ana', sabado);
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.entrega.id).toBe('52998224725_2026-11');
    }
    const repetida = await servico.registrar('52998224725', 'uid-carlos', sabado);
    expect(repetida.ok).toBe(false);
  });

  it('permite nova entrega no mês seguinte', async () => {
    await servico.registrar('52998224725', 'uid-ana', sabado);
    const dezembro = await servico.registrar('52998224725', 'uid-ana', new Date(2026, 11, 5, 9, 0));
    expect(dezembro.ok).toBe(true);
  });

  it('não registra entrega para família em espera ou inexistente', async () => {
    expect(await servico.registrar('11144477735', 'uid-ana', sabado)).toEqual({ ok: false, motivo: 'familia-nao-ativa' });
    expect(await servico.registrar('00000000191', 'uid-ana', sabado)).toEqual({ ok: false, motivo: 'familia-nao-encontrada' });
  });

  it('trata a recusa do repositório quando outro aparelho registrou antes', async () => {
    const existente: Entrega = {
      id: '52998224725_2026-11',
      familiaCpf: '52998224725',
      nomeResponsavel: 'Maria Souza',
      mesReferencia: '2026-11',
      dataHoraEntrega: new Date(2026, 10, 7, 8, 55),
      registradoPor: 'uid-carlos',
    };
    const repositorio = TestBed.inject(EntregaRepository);
    vi.spyOn(repositorio, 'buscarPorId').mockResolvedValue(undefined);
    vi.spyOn(repositorio, 'criar').mockRejectedValue(new EntregaJaExisteError(existente));

    const resultado = await servico.registrar('52998224725', 'uid-ana', sabado);
    expect(resultado).toEqual({ ok: false, motivo: 'ja-entregue', existente });
  });
});
