FROM node:23.5-slim AS builder
ENV HOME=/home/app

WORKDIR $HOME/frontend

COPY ./frontend/package.json ./frontend/package-lock.json* ./
RUN npm install
COPY ./frontend .
RUN npm run build

FROM node:23.5-slim AS runner

WORKDIR /home/app/frontend
COPY --from=builder /home/app/frontend/.next/standalone  ./
COPY --from=builder /home/app/frontend/.next/static  ./.next/static
COPY --from=builder /home/app/frontend/public ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
