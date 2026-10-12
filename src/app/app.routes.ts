import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Cesta Certa', loadComponent: () => import('./features/menu/menu').then((m) => m.Menu) },
  {
    path: 'entrega',
    title: 'Entrega do mês – Cesta Certa',
    loadComponent: () => import('./features/entrega-mes/entrega-mes').then((m) => m.EntregaMes),
  },
  {
    path: 'familias',
    title: 'Cadastrar família – Cesta Certa',
    loadComponent: () => import('./features/familias/cadastro-familia').then((m) => m.CadastroFamilia),
  },
  { path: '**', redirectTo: '' },
];
