FROM node:23.5-slim

ENV HOME=/home/app
ENV APP_HOME=/home/app

WORKDIR $APP_HOME

COPY /frontend/ .

RUN npm install

EXPOSE 3000
