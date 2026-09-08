# Panel de TuPack (Next 16). Se construye con el contexto en esta carpeta.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next necesita la variable en build para no fallar al importar db.ts; la real
# la pone EasyPanel en runtime.
ENV TUPACK_DATABASE_URL=postgres://build:build@localhost:5432/build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S tupack -u 1001
COPY --from=build --chown=tupack:nodejs /app/.next/standalone ./
COPY --from=build --chown=tupack:nodejs /app/.next/static ./.next/static
USER tupack
EXPOSE 3000
CMD ["node", "server.js"]
