FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

ADD ./nginx/dev/nginx.conf /etc/nginx/conf.d/nginx.conf
ADD ./nginx/dev/ssl/selfsigned.crt /etc/nginx/ssl/selfsigned.crt
ADD ./nginx/dev/ssl/selfsigned.key /etc/nginx/ssl/selfsigned.key
ADD ./nginx/dev/custom_pages/50x.html /usr/share/nginx/html/50x.html

CMD ["nginx-debug", "-g", "daemon off;"]