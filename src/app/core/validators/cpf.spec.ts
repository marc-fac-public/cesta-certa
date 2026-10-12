import { cpfValido, mascararCpf, nomeParaBusca, normalizarCpf } from './cpf';

describe('validador de CPF', () => {
  it('aceita CPFs válidos com e sem pontuação', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('11144477735')).toBe(true);
  });

  it('rejeita dígitos verificadores errados', () => {
    expect(cpfValido('529.982.247-24')).toBe(false);
  });

  it('rejeita tamanho diferente de 11 dígitos e letras', () => {
    expect(cpfValido('5299822472')).toBe(false);
    expect(cpfValido('529.982.247-2a')).toBe(false);
  });

  it('rejeita sequências repetidas', () => {
    expect(cpfValido('111.111.111-11')).toBe(false);
  });

  it('normaliza mantendo apenas os dígitos', () => {
    expect(normalizarCpf('529.982.247-25')).toBe('52998224725');
  });

  it('mascara o CPF para exibição', () => {
    expect(mascararCpf('52998224725')).toBe('***.982.247-**');
  });

  it('gera o nome de busca sem acentos e em minúsculas', () => {
    expect(nomeParaBusca('  Antônia   RIBEIRO ')).toBe('antonia ribeiro');
  });
});
