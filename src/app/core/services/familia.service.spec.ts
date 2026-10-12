import { TestBed } from '@angular/core/testing';
import { NovaFamilia } from '../models/familia';
import { FamiliaRepository } from '../repositories/familia.repository';
import { FamiliaMemoriaRepository } from '../repositories/memoria/familia-memoria.repository';
import { FamiliaService } from './familia.service';

const mariaSouza: NovaFamilia = {
  cpfResponsavel: '529.982.247-25',
  nomeResponsavel: 'Maria Souza',
  endereco: 'Quadra 104, Conjunto 3, Casa 10',
  numMoradores: 4,
  status: 'ativa',
};

describe('FamiliaService', () => {
  let servico: FamiliaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: FamiliaRepository, useClass: FamiliaMemoriaRepository }],
    });
    servico = TestBed.inject(FamiliaService);
  });

  it('cadastra uma família válida com CPF normalizado e nome de busca', async () => {
    const resultado = await servico.cadastrar(mariaSouza, 'uid-ana');
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.familia.cpfResponsavel).toBe('52998224725');
      expect(resultado.familia.nomeBusca).toBe('maria souza');
      expect(resultado.familia.cadastradoPor).toBe('uid-ana');
    }
  });

  it('impede o cadastro de CPF já existente, mesmo digitado sem pontuação (RF03)', async () => {
    await servico.cadastrar(mariaSouza, 'uid-ana');
    const resultado = await servico.cadastrar({ ...mariaSouza, cpfResponsavel: '52998224725', nomeResponsavel: 'Maria S.' }, 'uid-carlos');
    expect(resultado.ok).toBe(false);
    if (!resultado.ok && resultado.motivo === 'cpf-duplicado') {
      expect(resultado.existente.nomeResponsavel).toBe('Maria Souza');
    } else {
      throw new Error('esperava motivo cpf-duplicado');
    }
  });

  it('rejeita CPF inválido, campos vazios e número de moradores menor que 1', async () => {
    const resultado = await servico.cadastrar(
      { ...mariaSouza, cpfResponsavel: '123', nomeResponsavel: ' ', endereco: '', numMoradores: 0 },
      'uid-ana',
    );
    expect(resultado.ok).toBe(false);
    if (!resultado.ok && resultado.motivo === 'dados-invalidos') {
      expect(Object.keys(resultado.erros).sort()).toEqual(['cpfResponsavel', 'endereco', 'nomeResponsavel', 'numMoradores']);
    }
  });

  it('rejeita nome com código HTML (prevenção de XSS)', async () => {
    const resultado = await servico.cadastrar({ ...mariaSouza, nomeResponsavel: '<img src=x onerror=alert(1)>' }, 'uid-ana');
    expect(resultado.ok).toBe(false);
  });

  it('busca por parte do nome, ignorando acentos e maiúsculas (RF05)', async () => {
    await servico.cadastrar(mariaSouza, 'uid-ana');
    await servico.cadastrar({ ...mariaSouza, cpfResponsavel: '111.444.777-35', nomeResponsavel: 'Antônia Ribeiro' }, 'uid-ana');
    expect((await servico.buscar('MARIA sou')).map((f) => f.nomeResponsavel)).toEqual(['Maria Souza']);
    expect((await servico.buscar('antonia')).map((f) => f.nomeResponsavel)).toEqual(['Antônia Ribeiro']);
  });

  it('busca por parte do CPF e ignora termos com menos de 3 caracteres', async () => {
    await servico.cadastrar(mariaSouza, 'uid-ana');
    expect(await servico.buscar('982.247')).toHaveLength(1);
    expect(await servico.buscar('ma')).toHaveLength(0);
  });
});
