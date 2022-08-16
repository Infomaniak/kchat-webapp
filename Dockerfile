FROM node:buster as vendor

LABEL maintainer="Léopold Jacquot <leopold.jacquot@infomaniak.com>"

WORKDIR /var/www/html

COPY scripts/*.sh /tmp/scripts/

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    # Install common packages, non-root user, update yarn
    && bash /tmp/scripts/node.sh

COPY . .

RUN export $(xargs < ./.env)

RUN yarn set version berry

RUN yarn

RUN yarn run build:webapp

FROM nginx:1.22.0

RUN apt-get update && apt-get install -y nginx-extras

WORKDIR /var/www/html

COPY --from=vendor /var/www/html/dist /var/www/html/static
