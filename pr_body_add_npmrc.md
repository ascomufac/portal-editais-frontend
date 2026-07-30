Add .npmrc with legacy-peer-deps=true

Adiciona .npmrc com legacy-peer-deps=true para ignorar a verificação rígida de peerDependencies durante a instalação no CI. Isso resolve a falha temporária do build causada por incompatibilidade entre React 19 e algumas dependências (ex: recharts). Recomenda-se uma solução permanente em seguida (downgrade do React para 18 ou migração das bibliotecas afetadas).
