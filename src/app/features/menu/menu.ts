import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BotaoLetra } from '../../shared/botao-letra';
import { USUARIO_DEMO } from '../../core/demo/dados-demo';
import { EntregaService, mesDeReferencia } from '../../core/services/entrega.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, BotaoLetra],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit {
  private readonly entregas = inject(EntregaService);
  protected readonly usuario = USUARIO_DEMO;
  protected readonly hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  protected readonly entregues = signal(0);
  protected readonly total = signal(0);

  async ngOnInit(): Promise<void> {
    const itens = await this.entregas.listaDoMes(mesDeReferencia(new Date()));
    this.total.set(itens.length);
    this.entregues.set(itens.filter((i) => i.entrega).length);
  }
}
