FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

ADD ./nginx/prod/nginx.conf /etc/nginx/conf.d/nginx.conf
ADD ./nginx/prod/custom_pages/50x.html /usr/share/nginx/html/50x.html

CMD ["nginx-debug", "-g", "daemon off;"]