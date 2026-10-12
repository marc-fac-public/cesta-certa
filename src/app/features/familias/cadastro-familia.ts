import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BotaoLetra } from '../../shared/botao-letra';
import { USUARIO_DEMO } from '../../core/demo/dados-demo';
import { FamiliaService } from '../../core/services/familia.service';
import { cpfValido, mascararCpf } from '../../core/validators/cpf';

type Campo = 'nomeResponsavel' | 'cpfResponsavel' | 'endereco' | 'telefone' | 'numMoradores';

/** Cadastro de família com validação de CPF e bloqueio de duplicidade (RF02 e RF03). */
@Component({
  selector: 'app-cadastro-familia',
  imports: [ReactiveFormsModule, RouterLink, BotaoLetra],
  templateUrl: './cadastro-familia.html',
  styleUrl: './cadastro-familia.scss',
})
export class CadastroFamilia {
  private readonly familias = inject(FamiliaService);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nomeResponsavel: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(/^[^<>]*$/)]],
    cpfResponsavel: ['', [Validators.required, (c: { value: string }) => (c.value && !cpfValido(c.value) ? { cpf: true } : null)]],
    endereco: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(/^[^<>]*$/)]],
    telefone: [''],
    numMoradores: [1, [Validators.required, Validators.min(1)]],
    status: ['ativa' as 'ativa' | 'espera'],
  });

  protected readonly enviado = signal(false);
  protected readonly salvando = signal(false);
  protected readonly sucesso = signal<string | null>(null);
  protected readonly duplicado = signal<{ nome: string; cpf: string } | null>(null);
  protected readonly errosServidor = signal<Record<string, string>>({});

  private readonly mensagens: Record<Campo, string> = {
    nomeResponsavel: 'Informe o nome do responsável, sem os caracteres < e >.',
    cpfResponsavel: 'CPF inválido: confira os 11 números.',
    endereco: 'Informe o endereço, sem os caracteres < e >.',
    telefone: '',
    numMoradores: 'O número de moradores deve ser 1 ou mais.',
  };

  protected erro(campo: Campo): string | null {
    const controle = this.form.controls[campo];
    if (this.errosServidor()[campo]) return this.errosServidor()[campo];
    return (this.enviado() || controle.touched) && controle.invalid ? this.mensagens[campo] : null;
  }

  protected async salvar(): Promise<void> {
    this.enviado.set(true);
    this.sucesso.set(null);
    this.duplicado.set(null);
    this.errosServidor.set({});
    if (this.form.invalid) {
      return;
    }
    this.salvando.set(true);
    const resultado = await this.familias.cadastrar(this.form.getRawValue(), USUARIO_DEMO.uid);
    this.salvando.set(false);
    if (resultado.ok) {
      this.sucesso.set(resultado.familia.nomeResponsavel);
      this.form.reset();
      this.enviado.set(false);
    } else if (resultado.motivo === 'cpf-duplicado') {
      this.duplicado.set({ nome: resultado.existente.nomeResponsavel, cpf: mascararCpf(resultado.existente.cpfResponsavel) });
    } else {
      this.errosServidor.set(resultado.erros);
    }
  }
}
