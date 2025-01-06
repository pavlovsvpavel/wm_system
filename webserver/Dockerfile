FROM node:23.5-slim AS builder

ENV HOME=/home/app
ENV APP_HOME=/home/app/frontend

WORKDIR $APP_HOME

COPY /front_end/package.json .
RUN npm install
COPY /front_end/ .
RUN npm run build


FROM nginx:latest

# Copy Nginx configuration
COPY ./webserver/default.conf /etc/nginx/conf.d/default.conf

# Copy Next.js static files
COPY --from=builder /home/app/frontend/.next/static /usr/share/nginx/html/_next/static

# Copy Next.js server-side files
COPY --from=builder /home/app/frontend/.next/server /usr/share/nginx/html/_next/server

# Copy public folder (if you have one)
COPY --from=builder /home/app/frontend/public /usr/share/nginx/html