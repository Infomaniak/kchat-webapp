FROM node:16 as vendor

LABEL maintainer="Léopold Jacquot <leopold.jacquot@infomaniak.com>"

WORKDIR /var/www/html

COPY package*.json ./

RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .

RUN npm run build

FROM nginx:1.22.0

RUN apt-get update && apt-get install -y nginx-extras

WORKDIR /var/www/html

COPY --from=vendor /var/www/html/dist /var/www/html/static
