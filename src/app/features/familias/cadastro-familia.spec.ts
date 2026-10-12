import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FamiliaRepository } from '../../core/repositories/familia.repository';
import { FamiliaMemoriaRepository } from '../../core/repositories/memoria/familia-memoria.repository';
import { CadastroFamilia } from './cadastro-familia';

async function montar() {
  TestBed.configureTestingModule({
    imports: [CadastroFamilia],
    providers: [provideRouter([]), { provide: FamiliaRepository, useClass: FamiliaMemoriaRepository }],
  });
  const fixture = TestBed.createComponent(CadastroFamilia);
  fixture.detectChanges();
  const tela = fixture.nativeElement as HTMLElement;
  const preencher = (id: string, valor: string) => {
    const campo = tela.querySelector<HTMLInputElement>(`#${id}`)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  };
  const salvar = async () => {
    tela.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { fixture, tela, preencher, salvar };
}

describe('CadastroFamilia (tela)', () => {
  it('mostra mensagens de erro associadas aos campos inválidos', async () => {
    const { tela, preencher, salvar } = await montar();
    preencher('cpf', '123.456.789-00');
    await salvar();
    const cpf = tela.querySelector('#cpf')!;
    expect(cpf.getAttribute('aria-invalid')).toBe('true');
    expect(tela.querySelector(`#${cpf.getAttribute('aria-describedby')}`)?.textContent).toContain('CPF inválido');
    expect(tela.querySelector('#erro-nome')).not.toBeNull();
  });

  it('cadastra uma família válida e depois avisa sobre o CPF duplicado (RF02 e RF03)', async () => {
    const { tela, preencher, salvar } = await montar();
    preencher('nome', 'Maria Souza');
    preencher('cpf', '529.982.247-25');
    preencher('endereco', 'Quadra 104');
    await salvar();
    expect(tela.querySelector('.alerta.ok')?.textContent).toContain('Maria Souza cadastrada');

    preencher('nome', 'Maria S.');
    preencher('cpf', '52998224725');
    preencher('endereco', 'Outra rua');
    await salvar();
    const aviso = tela.querySelector('.alerta.aviso');
    expect(aviso?.getAttribute('role')).toBe('alert');
    expect(aviso?.textContent).toContain('CPF já cadastrado');
    expect(aviso?.textContent).toContain('Maria Souza');
  });
});
