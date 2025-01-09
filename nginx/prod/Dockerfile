FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

ADD ./nginx/prod/nginx.conf /etc/nginx/conf.d/nginx.conf

CMD ["nginx-debug", "-g", "daemon off;"]