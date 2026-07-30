FROM node:24.8-slim AS builder

WORKDIR /usr/src/app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN npm install --no-audit --no-fund

COPY prisma ./prisma

COPY . .

RUN npx prisma generate --schema=./prisma/schema.prisma || true
RUN npm run build

FROM node:24.8-slim AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main"]