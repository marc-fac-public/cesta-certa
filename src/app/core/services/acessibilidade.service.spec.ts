import { TestBed } from '@angular/core/testing';
import { AcessibilidadeService } from './acessibilidade.service';

describe('AcessibilidadeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('letra-grande');
  });

  it('liga e desliga a letra maior aplicando a classe na página e lembrando a escolha', () => {
    const servico = TestBed.inject(AcessibilidadeService);
    servico.alternar();
    TestBed.tick();
    expect(document.documentElement.classList.contains('letra-grande')).toBe(true);
    expect(localStorage.getItem('cesta-certa:letra-grande')).toBe('1');

    servico.alternar();
    TestBed.tick();
    expect(document.documentElement.classList.contains('letra-grande')).toBe(false);
    expect(localStorage.getItem('cesta-certa:letra-grande')).toBe('0');
  });
});
