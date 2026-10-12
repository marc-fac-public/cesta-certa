import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { carregarDadosDemo } from './core/demo/dados-demo';
import { EntregaDemoRepository } from './core/demo/entrega-demo.repository';
import { EntregaRepository } from './core/repositories/entrega.repository';
import { FamiliaRepository } from './core/repositories/familia.repository';
import { FamiliaMemoriaRepository } from './core/repositories/memoria/familia-memoria.repository';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

/**
 * Modo demonstração: repositórios em memória com dados fictícios.
 * Ao configurar o Firebase, basta trocar estes provedores pelos repositórios do Firestore.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    FamiliaMemoriaRepository,
    EntregaDemoRepository,
    { provide: FamiliaRepository, useExisting: FamiliaMemoriaRepository },
    { provide: EntregaRepository, useExisting: EntregaDemoRepository },
    provideAppInitializer(() =>
      carregarDadosDemo(inject(FamiliaRepository), inject(EntregaDemoRepository)),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
