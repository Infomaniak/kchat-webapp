FROM node:16 as vendor

LABEL maintainer="Léopold Jacquot <leopold.jacquot@infomaniak.com>"

WORKDIR /var/www/html

COPY --chown=node:node . /var/www/html

RUN npm ci --prefer-offline --no-audit --no-fund
RUN npm run build

FROM nginx:1.19.3-alpine

WORKDIR /var/www/html

COPY --from=vendor /var/www/html/build /var/www/html
