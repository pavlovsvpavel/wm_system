FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive

# Update OS and install required libraries for psycopg2
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y apt-utils gettext libpq-dev gcc && \
    pip install psycopg2 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV HOME=/home/app
ENV APP_HOME=/home/app/backend

WORKDIR $APP_HOME

COPY ./requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .