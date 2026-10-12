# Cesta Certa

[![CI](https://github.com/marc-fac-public/cesta-certa/actions/workflows/ci.yml/badge.svg)](https://github.com/marc-fac-public/cesta-certa/actions/workflows/ci.yml)

Sistema web (PWA) para controle do cadastro de famílias e da entrega mensal de cestas básicas da **Associação Comunitária Raízes do Recanto** (Recanto das Emas – DF).

Projeto acadêmico da disciplina de **Projeto de Software** (Experiência Prática III), alinhado ao **ODS 2 – Fome Zero e Agricultura Sustentável (meta 2.1)**.

> Todos os dados usados no repositório, nos testes e nas demonstrações são **fictícios**.

## Problema

O cadastro das cerca de 180 famílias atendidas é feito em fichas de papel e mensagens de WhatsApp. Isso gera cadastros duplicados, cestas entregues duas vezes no mesmo mês, vagas presas por famílias que se mudaram e filas lentas no dia da distribuição.

## O que o MVP faz

| Requisito | Descrição | Prioridade |
|---|---|---|
| RF01 | Login com e-mail e senha, com telas por perfil (administrador/voluntário) | Obrigatório |
| RF02 | Cadastro de família com CPF válido | Obrigatório |
| RF03 | Bloqueio de CPF duplicado | Obrigatório |
| RF04 | Edição de dados e status (ativa / espera / inativa) | Obrigatório |
| RF05 | Busca por parte do nome ou CPF, mesmo sem internet | Obrigatório |
| RF06 | Lista de entrega do mês com status | Obrigatório |
| RF07 | Registro da entrega com um toque, mesmo sem internet | Obrigatório |
| RF08 | Bloqueio da segunda entrega no mesmo mês | Obrigatório |
| RF09 | Lista de famílias que não compareceram | Desejável |
| RF10 | Relatório mensal compartilhável | Desejável |

## Arquitetura

Aplicação Angular monolítica em camadas:

- **Apresentação** (`src/app/features`): componentes de tela.
- **Regras de negócio** (`src/app/core/services`): validação de CPF, duplicidade, uma entrega por família por mês.
- **Persistência** (`src/app/core/repositories`): único ponto de acesso ao Cloud Firestore (cache offline em IndexedDB).

## Tecnologias

- Angular 22 · TypeScript 6.0 · Node.js 24 LTS
- Angular Service Worker (PWA) · Angular Material
- Firebase JS SDK 12 (Firestore + Authentication) · Firebase Hosting
- Vitest (testes unitários e de integração)
- GitHub Actions (integração contínua)

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

## Fluxo de trabalho

- Branch principal: `main` (protegida, recebe código apenas por Pull Request).
- Cada funcionalidade em uma branch própria (`feat/...`, `fix/...`, `test/...`).
- Commits semânticos ([Conventional Commits](https://www.conventionalcommits.org/pt-br/)): `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `ci:`, `refactor:`.
- Todo Pull Request passa por auto-revisão com checklist antes do merge.
