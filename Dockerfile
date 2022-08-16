FROM node:buster as vendor

LABEL maintainer="Léopold Jacquot <leopold.jacquot@infomaniak.com>"

WORKDIR /var/www/html

COPY package*.json ./

COPY .env ./

RUN npx yarn

COPY . .

RUN export $(xargs < ./.env) && npx yarn run build:webapp

FROM nginx:1.22.0

RUN apt-get update && apt-get install -y nginx-extras

WORKDIR /var/www/html

COPY --from=vendor /var/www/html/dist /var/www/html/static
