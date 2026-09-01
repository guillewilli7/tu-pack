# Imagen de producción del panel de TuPack (EasyPanel / cualquier host Docker).
#
# El build de esbuild deja un bundle con las dependencias adentro
# (artifacts/api-server/dist), así que la imagen final no necesita node_modules:
# solo Node y ese directorio.

FROM node:24-alpine AS build
WORKDIR /repo
RUN corepack enable

# Primero los manifiestos: si no cambian, esta capa se reutiliza entre builds.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/api-spec/package.json        ./lib/api-spec/
COPY lib/api-zod/package.json         ./lib/api-zod/
COPY lib/db/package.json              ./lib/db/
COPY lib/api-client-react/package.json ./lib/api-client-react/
# --allow-build: pnpm 11 no toma el onlyBuiltDependencies del workspace en esta
# instalación y aborta si esbuild no puede correr su script de instalación.
RUN pnpm install --frozen-lockfile --allow-build=esbuild

COPY . .
RUN pnpm --filter @workspace/api-server run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Usuario sin privilegios: la app no escribe en disco, solo sirve HTTP.
RUN addgroup -g 1001 -S nodejs && adduser -S tupack -u 1001
COPY --from=build --chown=tupack:nodejs /repo/artifacts/api-server/dist ./dist
USER tupack

EXPOSE 3000
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
