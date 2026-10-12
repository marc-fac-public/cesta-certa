import { Component, inject } from '@angular/core';
import { AcessibilidadeService } from '../core/services/acessibilidade.service';

/** Botão que liga e desliga a letra maior em todas as telas. */
@Component({
  selector: 'app-botao-letra',
  template: `
    <button type="button" class="btn-letra" [attr.aria-pressed]="acessibilidade.letraGrande()" (click)="acessibilidade.alternar()">
      <span aria-hidden="true">A+</span> Letra<span class="sr-only"> maior</span>
    </button>
  `,
  styles: `:host { margin-left: auto; }`,
})
export class BotaoLetra {
  protected readonly acessibilidade = inject(AcessibilidadeService);
}
