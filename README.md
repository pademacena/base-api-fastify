# Base API Fastify

Este é um projeto de exemplo de uma API básica construída com [Fastify](https://fastify.dev/), utilizando TypeScript para tipagem forte, [Zod](https://zod.dev/) para validação de dados e [Swagger](https://swagger.io/) para documentação automática da API.

## Funcionalidades

- **Servidor HTTP**: Servidor Fastify rodando na porta 3333.
- **Rotas de Usuários**: 
  - `GET /users`: Lista todos os usuários.
  - `POST /users`: Cria um novo usuário com validação de nome e email.
- **Documentação**: Interface Swagger UI disponível em `/docs`.
- **CORS**: Configurado para permitir todas as origens.
- **Tipagem**: Utiliza `fastify-type-provider-zod` para integração entre Fastify e Zod.

## Estrutura do Projeto

```
base-api-fastify/
├── src/
│   ├── routes.ts      # Definição das rotas da API
│   ├── server.ts      # Configuração e inicialização do servidor
│   └── types.ts       # Tipos TypeScript personalizados
├── package.json       # Dependências e scripts
├── tsconfig.json      # Configuração do TypeScript
└── README.md          # Este arquivo
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com Node.js)

## Instalação e Configuração do Zero

Siga estes passos para criar e configurar o projeto do zero:

### 1. Inicializar o Projeto

```bash
mkdir base-api-fastify
cd base-api-fastify
npm init -y
```

### 2. Instalar Dependências

Instale as dependências principais:

```bash
npm install fastify @fastify/cors @fastify/swagger @fastify/swagger-ui fastify-type-provider-zod zod
```

Instale as dependências de desenvolvimento:

```bash
npm install -D @types/node tsx typescript
```

### 3. Configurar TypeScript

Crie o arquivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Criar Estrutura de Arquivos

Crie a pasta `src` e os arquivos conforme a estrutura acima.

**src/types.ts**:
```typescript
import type { FastifyBaseLogger, FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export type FastifyTypedInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastBaseLogger,
  ZodTypeProvider
>
```

**src/server.ts**:
```typescript
import { fastify } from 'fastify';
import { fastifyCors} from '@fastify/cors';
import { validatorCompiler, serializerCompiler, jsonSchemaTransform} from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { routes } from './routes';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {origin: '*'})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Type API',
      version: '1.0.0'
    }
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs'
});

app.register(routes)

app.listen({ port: 3333}).then(() => {
  console.log('HTTP server running')
});
```

**src/routes.ts**:
```typescript
import type { FastifyInstance } from "fastify";
import z from "zod";
import type { FastifyTypedInstance } from "./types";
import { randomUUID } from "node:crypto";

interface UserInterface {
  id: string,
  name: string,
  email: string,
}

const users: UserInterface[] = []

export async function routes(app: FastifyTypedInstance) {
  app.get('/users', {
    schema: {
      tags: ['users'],
      description: 'Show Users',
      response: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          email: z.string()
        }))
      }
    }
  }, async (request, reply) => {
    return reply.status(200).send(users)
  })

  app.post('/users', {
    schema: {
      tags: ['users'],
      description: 'Create a new User',
      body: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      response: {
        201: z.null().describe('User Created')
      }
    }
  }, async (request, reply) => {
    const {name, email} = request.body;

    users.push({
      id: randomUUID(),
      name,
      email
    })

    return reply.status(201).send()
  })
}
```

### 5. Atualizar package.json

Adicione o script de desenvolvimento no `package.json`:

```json
{
  "name": "base-api-fastify",
  "version": "1.0.0",
  "description": "API básica com Fastify, TypeScript, Zod e Swagger",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@fastify/cors": "^11.2.0",
    "@fastify/swagger": "^9.6.1",
    "@fastify/swagger-ui": "^5.2.3",
    "fastify": "^5.6.2",
    "fastify-type-provider-zod": "^6.1.0",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@types/node": "^25.0.2",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  }
}
```

## Como Executar

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3333`.

### Build e Produção

```bash
npm run build
npm start
```

## Documentação da API

Acesse `http://localhost:3333/docs` para visualizar a documentação interativa gerada pelo Swagger UI.

## Tecnologias Utilizadas

- **Fastify**: Framework web rápido e de baixo overhead para Node.js.
- **TypeScript**: Superset do JavaScript com tipagem estática.
- **Zod**: Biblioteca de validação e parsing de esquemas.
- **Swagger/OpenAPI**: Padrão para documentação de APIs.
- **CORS**: Middleware para permitir requisições de diferentes origens.

## Próximos Passos

- Adicionar persistência de dados (banco de dados).
- Implementar autenticação e autorização.
- Adicionar mais rotas e funcionalidades.
- Configurar testes automatizados.
- Deploy em produção.
