# Cesta Certa

[![CI](https://github.com/marc-fac-public/cesta-certa/actions/workflows/ci.yml/badge.svg)](https://github.com/marc-fac-public/cesta-certa/actions/workflows/ci.yml)
[![Deploy](https://github.com/marc-fac-public/cesta-certa/actions/workflows/deploy.yml/badge.svg)](https://github.com/marc-fac-public/cesta-certa/actions/workflows/deploy.yml)
[![Monitoramento](https://github.com/marc-fac-public/cesta-certa/actions/workflows/monitoramento.yml/badge.svg)](https://github.com/marc-fac-public/cesta-certa/actions/workflows/monitoramento.yml)

Sistema web (PWA) para controle do cadastro de famílias e da entrega mensal de cestas básicas da **Associação Comunitária Raízes do Recanto** (Recanto das Emas – DF).

Projeto acadêmico da disciplina de **Projeto de Software** (Experiência Prática III), alinhado ao **ODS 2 – Fome Zero e Agricultura Sustentável (meta 2.1)**.

**Aplicação publicada:** https://marc-fac-public.github.io/cesta-certa/ (modo demonstração com dados fictícios)

> Todos os dados usados no repositório, nos testes e nas demonstrações são **fictícios**.

## Problema

O cadastro das cerca de 180 famílias atendidas é feito em fichas de papel e mensagens de WhatsApp. Isso gera cadastros duplicados, cestas entregues duas vezes no mesmo mês, vagas presas por famílias que se mudaram e filas lentas no dia da distribuição.

## O que o MVP faz (versão final)

| Requisito | Descrição | Situação |
|---|---|---|
| RF02 | Cadastro de família com CPF válido | ✅ Implementado |
| RF03 | Bloqueio de CPF duplicado | ✅ Implementado |
| RF05 | Busca por parte do nome ou CPF, mesmo sem internet | ✅ Implementado |
| RF06 | Lista de entrega do mês com status e endereço | ✅ Implementado |
| RF07 | Registro da entrega com um toque, mesmo sem internet | ✅ Implementado |
| RF08 | Bloqueio da segunda entrega no mesmo mês | ✅ Implementado |
| RF09 | Filtro "Faltam receber" | ✅ Implementado |
| RNF04 | Acessibilidade: botão "A+ Letra", alto contraste, alertas com texto e símbolo | ✅ Implementado |
| RF01 | Login com e-mail e senha por perfil | ⏳ Próxima versão |
| RF04 | Edição de dados e status da família | ⏳ Próxima versão |
| RF10 | Relatório mensal compartilhável | ⏳ Próxima versão |

## Arquitetura

Aplicação Angular monolítica em camadas:

- **Apresentação** (`src/app/features`): telas de menu, entrega do mês e cadastro.
- **Regras de negócio** (`src/app/core/services`): validação de CPF, duplicidade, uma entrega por família por mês.
- **Persistência** (`src/app/core/repositories`): contratos de repositório. Na versão atual, a implementação é em memória (modo demonstração com dados fictícios, `src/app/core/demo`); a integração com o Cloud Firestore exige apenas novos repositórios e a troca dos provedores em `app.config.ts`.

## Tecnologias

- Angular 22 (componentes standalone, signals, Reactive Forms) · TypeScript 6.0 · Node.js 24 LTS
- Angular Service Worker (PWA) e Web App Manifest
- SCSS próprio com foco em acessibilidade (rem, contraste, áreas de toque de 48 px)
- Vitest + coverage-v8 (testes unitários, de integração e de componente)
- GitHub Actions (CI, deploy e monitoramento) · GitHub Pages (hospedagem)

## Como executar

Pré-requisito: Node.js 24 (ver `.nvmrc`).

```bash
npm ci            # instala as dependências exatas do package-lock.json
npm start         # servidor de desenvolvimento em http://localhost:4200
npm run test:ci   # executa os testes uma vez
npm run test:coverage  # testes + relatório de cobertura (pasta coverage/)
npm run build     # gera o build de produção em dist/
```

## Estrutura do código

```
src/app/core/
├── models/         # Familia, Entrega, Usuario
├── validators/     # CPF: validação, máscara e nome para busca
├── repositories/   # contratos de persistência + implementação em memória
├── services/       # FamiliaService e EntregaService (regras de negócio)
└── integracao/     # testes de integração do fluxo de entrega
```

## Testes

| Tipo | Arquivo | O que verifica |
|---|---|---|
| Unitário | `validators/cpf.spec.ts` | dígitos verificadores, máscara e busca sem acentos |
| Unitário | `services/familia.service.spec.ts` | cadastro, CPF duplicado (RF03), XSS e busca (RF05) |
| Unitário | `services/entrega.service.spec.ts` | registro (RF07) e bloqueio da 2ª entrega no mês (RF08) |
| Integração | `integracao/fluxo-entrega.integration.spec.ts` | fluxo completo do sábado de entrega com dois voluntários |

A pipeline de CI (`.github/workflows/ci.yml`) executa testes, build e `npm audit` em todo Pull Request.
O workflow `.github/workflows/monitoramento.yml` verifica a cada 30 minutos se a aplicação publicada responde; se cair, abre automaticamente uma issue de alerta e a fecha quando o serviço volta.
O workflow `.github/workflows/deploy.yml` publica a versão da `main` no GitHub Pages, somente se os testes passarem.

## Fluxo de trabalho

- Branch principal: `main` (protegida, recebe código apenas por Pull Request).
- Cada funcionalidade em uma branch própria (`feat/...`, `fix/...`, `test/...`).
- Commits semânticos ([Conventional Commits](https://www.conventionalcommits.org/pt-br/)): `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `ci:`, `refactor:`.
- Todo Pull Request passa por auto-revisão com checklist antes do merge.
