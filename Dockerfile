FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV KWICKY_API_URL=https://mhyxplkuzgwnoxphjvgt.supabase.co/functions/v1/kwicky-ai-tool

ENTRYPOINT ["node", "dist/index.js"]
