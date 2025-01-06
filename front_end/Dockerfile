FROM node:23.5-slim

ENV HOME=/home/app
ENV APP_HOME=/home/app/frontend

WORKDIR $APP_HOME

COPY /front_end/ .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "dev" ]