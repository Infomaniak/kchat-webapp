FROM node:16 as vendor

LABEL maintainer="Léopold Jacquot <leopold.jacquot@infomaniak.com>"

WORKDIR /var/www/html

COPY scripts/*.sh /tmp/scripts/

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    # Install common packages, non-root user, update yarn
    && bash /tmp/scripts/node.sh

COPY . .

RUN yarn

# RUN yarn workspace @mattermost/types build
# RUN yarn workspace @mattermost/client build

RUN yarn workspace @mattermost/components build

# RUN yarn workspace mattermost-webapp build

RUN make build

# COPY .yarn/cache/* .yarn/cache/

# COPY .yarn/install-state.gz .yarn/install-state.gz

FROM nginx:1.22.0

RUN apt-get update && apt-get install -y nginx-extras

WORKDIR /var/www/html

COPY --from=vendor /var/www/html/dist /var/www/html/static
