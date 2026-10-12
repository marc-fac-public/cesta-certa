import { Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BotaoLetra } from '../../shared/botao-letra';
import { USUARIO_DEMO } from '../../core/demo/dados-demo';
import { formatarHora, nomeDoVoluntario } from '../../core/formatacao';
import { EntregaService, ItemListaDoMes, mesDeReferencia } from '../../core/services/entrega.service';
import { mascararCpf, nomeParaBusca, normalizarCpf } from '../../core/validators/cpf';

interface Confirmacao {
  nome: string;
  hora: string;
}

interface AvisoDuplicidade {
  nome: string;
  hora: string;
  voluntario: string;
}

/** Tela central: buscar a família na fila e registrar a retirada da cesta (RF05–RF08). */
@Component({
  selector: 'app-entrega-mes',
  imports: [RouterLink, BotaoLetra],
  templateUrl: './entrega-mes.html',
  styleUrl: './entrega-mes.scss',
})
export class EntregaMes implements OnInit {
  private readonly entregas = inject(EntregaService);
  private readonly botaoEntendi = viewChild<ElementRef<HTMLButtonElement>>('entendi');
  private readonly campoBusca = viewChild<ElementRef<HTMLInputElement>>('campo');

  protected readonly mes = mesDeReferencia(new Date());
  protected readonly nomeDoMes = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  protected readonly itens = signal<ItemListaDoMes[]>([]);
  protected readonly busca = signal('');
  protected readonly registrando = signal<string | null>(null);
  protected readonly confirmacao = signal<Confirmacao | null>(null);
  protected readonly aviso = signal<AvisoDuplicidade | null>(null);
  protected readonly erro = signal(false);
  protected readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);

  protected readonly entregues = computed(() => this.itens().filter((i) => i.entrega).length);
  protected readonly filtrados = computed(() => {
    const texto = nomeParaBusca(this.busca());
    if (texto.length < 3) {
      return this.itens();
    }
    const digitos = normalizarCpf(this.busca());
    return this.itens().filter(
      (i) => i.familia.nomeBusca.includes(texto) || (digitos.length >= 3 && i.familia.cpfResponsavel.includes(digitos)),
    );
  });
  protected readonly mensagemBusca = computed(() => {
    const tamanho = nomeParaBusca(this.busca()).length;
    if (tamanho === 0) return 'Lista do mês';
    if (tamanho < 3) return 'Digite pelo menos 3 letras para buscar.';
    const n = this.filtrados().length;
    return n === 1 ? '1 família encontrada' : `${n} famílias encontradas`;
  });

  protected readonly mascarar = mascararCpf;
  protected readonly hora = formatarHora;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.online.set(true));
      window.addEventListener('offline', () => this.online.set(false));
    }
  }

  async ngOnInit(): Promise<void> {
    await this.recarregar();
  }

  protected aoDigitar(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }

  protected limpar(campo: HTMLInputElement): void {
    this.busca.set('');
    campo.value = '';
    campo.focus();
  }

  protected async entregar(item: ItemListaDoMes): Promise<void> {
    this.registrando.set(item.familia.cpfResponsavel);
    this.erro.set(false);
    try {
      const resultado = await this.entregas.registrar(item.familia.cpfResponsavel, USUARIO_DEMO.uid);
      if (resultado.ok) {
        this.confirmacao.set({ nome: item.familia.nomeResponsavel, hora: formatarHora(resultado.entrega.dataHoraEntrega) });
        this.prepararProximaBusca();
      } else if (resultado.motivo === 'ja-entregue') {
        this.aviso.set({
          nome: item.familia.nomeResponsavel,
          hora: formatarHora(resultado.existente.dataHoraEntrega),
          voluntario: nomeDoVoluntario(resultado.existente.registradoPor),
        });
        setTimeout(() => this.botaoEntendi()?.nativeElement.focus());
      } else {
        this.erro.set(true);
      }
    } catch {
      this.erro.set(true);
    } finally {
      this.registrando.set(null);
      await this.recarregar();
    }
  }

  protected fecharAviso(): void {
    this.aviso.set(null);
    this.prepararProximaBusca();
  }

  /** Feedback da rodada 1: após cada atendimento, a busca fica vazia e com foco para o próximo nome. */
  private prepararProximaBusca(): void {
    this.busca.set('');
    const campo = this.campoBusca()?.nativeElement;
    if (campo) {
      campo.value = '';
      setTimeout(() => campo.focus());
    }
  }

  private async recarregar(): Promise<void> {
    this.itens.set(await this.entregas.listaDoMes(this.mes));
  }
}
