FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

ADD ./nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
ADD ./nginx/ssl/selfsigned.crt /etc/nginx/ssl/selfsigned.crt
ADD ./nginx/ssl/selfsigned.key /etc/nginx/ssl/selfsigned.key

CMD ["nginx-debug", "-g", "daemon off;"]