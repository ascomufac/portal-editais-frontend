# Projeto Editais Ufac

Portal de editais da UFAC (Next.js + Plone).

## Tecnologias

- Next.js / React / TypeScript  
- shadcn-ui / Tailwind CSS  
- Plone (API REST)

## Como rodar localmente

Certifique-se de ter o [Node.js e npm](https://github.com/nvm-sh/nvm#installing-and-updating) instalados.

```sh
git clone <SEU_GIT_URL>
cd <NOME_DO_PROJETO>
cp .env.example .env
npm install
npm run dev
```

Abra http://localhost:8080.

O `npm install` configura os git hooks do repositório (`core.hooksPath=.githooks`).

## Versionamento

A versão exibida no rodapé das sidebars (portal e admin) segue **semver** via tags Git (`vX.Y.Z`), com SHA do commit no tooltip (`v1.2.3+abc1234`).

### Hooks (automático em `main`)

Após cada commit em `main`/`master`, o hook `post-commit`:

1. Lê a mensagem (Conventional Commits)
2. Calcula o próximo semver (`feat:` → minor, `fix:` → patch, `!:` / `BREAKING CHANGE` → major)
3. Atualiza `package.json` e cria a tag anotada `vX.Y.Z`

Pular o bump: inclua `[skip version]` na mensagem ou use `SKIP_VERSION_BUMP=1`.

Bump manual:

```sh
npm run version:bump
```

### Deploy (CI)

O workflow GHCR injeta `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_GIT_SHA` e `NEXT_PUBLIC_BUILD_TIME` no `docker build` e publica tags `:latest`, `:vX.Y.Z` e `:<sha>`.
