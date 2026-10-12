import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

const CHAVE = 'cesta-certa:letra-grande';

/** Preferência de letra maior (RNF04), lembrada neste aparelho. */
@Injectable({ providedIn: 'root' })
export class AcessibilidadeService {
  private readonly documento = inject(DOCUMENT);
  readonly letraGrande = signal(this.ler());

  constructor() {
    effect(() => {
      const ativa = this.letraGrande();
      this.documento.documentElement.classList.toggle('letra-grande', ativa);
      try {
        localStorage.setItem(CHAVE, ativa ? '1' : '0');
      } catch {
        // Sem armazenamento disponível: a preferência vale só nesta sessão.
      }
    });
  }

  alternar(): void {
    this.letraGrande.update((ativa) => !ativa);
  }

  private ler(): boolean {
    try {
      return localStorage.getItem(CHAVE) === '1';
    } catch {
      return false;
    }
  }
}
