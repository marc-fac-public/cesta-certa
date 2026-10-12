import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { carregarDadosDemo } from '../../core/demo/dados-demo';
import { EntregaDemoRepository } from '../../core/demo/entrega-demo.repository';
import { EntregaRepository } from '../../core/repositories/entrega.repository';
import { FamiliaRepository } from '../../core/repositories/familia.repository';
import { FamiliaMemoriaRepository } from '../../core/repositories/memoria/familia-memoria.repository';
import { EntregaMes } from './entrega-mes';

async function montar() {
  TestBed.configureTestingModule({
    imports: [EntregaMes],
    providers: [
      provideRouter([]),
      FamiliaMemoriaRepository,
      EntregaDemoRepository,
      { provide: FamiliaRepository, useExisting: FamiliaMemoriaRepository },
      { provide: EntregaRepository, useExisting: EntregaDemoRepository },
    ],
  });
  await carregarDadosDemo(TestBed.inject(FamiliaRepository), TestBed.inject(EntregaDemoRepository));
  const fixture = TestBed.createComponent(EntregaMes);
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, tela: fixture.nativeElement as HTMLElement };
}

async function buscar(fixture: Awaited<ReturnType<typeof montar>>['fixture'], termo: string) {
  const campo = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#busca')!;
  campo.value = termo;
  campo.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  await fixture.whenStable();
}

async function entregar(fixture: Awaited<ReturnType<typeof montar>>['fixture'], nome: string) {
  const botao = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(`button[aria-label="Entregar cesta para ${nome}"]`)!;
  botao.click();
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  fixture.detectChanges();
}

describe('EntregaMes (tela)', () => {
  it('mostra só as famílias ativas, com o progresso do mês e CPF mascarado', async () => {
    const { tela } = await montar();
    expect(tela.querySelectorAll('.familia')).toHaveLength(5);
    expect(tela.querySelector('.progresso')?.textContent).toContain('2 de 5 entregues');
    expect(tela.textContent).toContain('***.982.247-**');
    expect(tela.textContent).not.toContain('52998224725');
  });

  it('filtra por parte do nome e informa a quantidade encontrada', async () => {
    const { fixture, tela } = await montar();
    await buscar(fixture, 'maria sou');
    expect(tela.querySelectorAll('.familia')).toHaveLength(2);
    expect(tela.textContent).toContain('2 famílias encontradas');
  });

  it('registra a entrega e exibe a confirmação com texto e símbolo', async () => {
    const { fixture, tela } = await montar();
    await entregar(fixture, 'Maria Souza');
    const alerta = tela.querySelector('.alerta.ok');
    expect(alerta?.getAttribute('role')).toBe('status');
    expect(alerta?.textContent).toContain('Cesta entregue para Maria Souza');
    expect(tela.querySelector('.progresso')?.textContent).toContain('3 de 5 entregues');
  });

  it('abre o aviso acessível quando outro aparelho já registrou a entrega (RF08)', async () => {
    const { fixture, tela } = await montar();
    await entregar(fixture, 'José Pereira');
    const dialogo = tela.querySelector('[role="alertdialog"]');
    expect(dialogo?.textContent).toContain('Cesta já entregue');
    expect(dialogo?.textContent).toContain('8h55');
    expect(dialogo?.textContent).toContain('Carlos Melo');
    (dialogo!.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(tela.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('mostra orientação quando a busca não encontra ninguém', async () => {
    const { fixture, tela } = await montar();
    await buscar(fixture, 'xyz');
    expect(tela.querySelector('.vazio')?.textContent).toContain('Nenhuma família encontrada');
  });
});

describe('EntregaMes (ajustes da rodada 1 de validação)', () => {
  it('mostra o endereço da família no cartão', async () => {
    const { fixture, tela } = await montar();
    await buscar(fixture, 'maria sou');
    const enderecos = [...tela.querySelectorAll('.familia .endereco')].map((e) => e.textContent?.trim());
    expect(enderecos).toEqual(['📍 Quadra 104, Conjunto 3, Casa 10', '📍 Quadra 108, Conjunto 1, Casa 22']);
  });

  it('limpa a busca depois de registrar a entrega, mantendo a confirmação', async () => {
    const { fixture, tela } = await montar();
    await buscar(fixture, 'maria sou');
    await entregar(fixture, 'Maria Souza');
    expect(tela.querySelector<HTMLInputElement>('#busca')!.value).toBe('');
    expect(tela.querySelectorAll('.familia')).toHaveLength(5);
    expect(tela.querySelector('.alerta.ok')?.textContent).toContain('Avise o administrador');
  });

  it('filtra apenas as famílias que faltam receber', async () => {
    const { fixture, tela } = await montar();
    const [, faltam] = tela.querySelectorAll<HTMLButtonElement>('.filtro');
    expect(faltam.textContent).toContain('Faltam receber (3)');
    faltam.click();
    fixture.detectChanges();
    expect(faltam.getAttribute('aria-pressed')).toBe('true');
    expect(tela.querySelectorAll('.familia')).toHaveLength(3);
    expect(tela.querySelector('.familia .status.entregue')).toBeNull();
  });
});
