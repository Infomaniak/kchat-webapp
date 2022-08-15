FROM node:16 as vendor

LABEL maintainer="Léopold Jacquot <leopold.jacquot@infomaniak.com>"

WORKDIR /var/www/html

COPY package*.json ./

COPY .env ./

RUN npm ci

COPY . .

RUN make build

FROM nginx:1.22.0

RUN apt-get update && apt-get install -y nginx-extras

WORKDIR /var/www/html

COPY --from=vendor /var/www/html/dist /var/www/html/static
