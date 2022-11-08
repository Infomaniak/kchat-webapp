# ktalk-webapp

HALL OF FAME

> Jsais pas, essaye un window.location = 'kchat.infomaniak.com'

Leopold Jacquot, 2022 🏆

nb. cela a marché...

## install + watch

.env file with

```dotenv
WEBCOMPONENT_ENDPOINT=https://web-components.storage.infomaniak.com/next
WEBCOMPONENT_API_ENDPOINT=https://welcome.preprod.dev.infomaniak.ch
MANAGER_ENDPOINT=https://manager.preprod.dev.infomaniak.ch/
LOGIN_ENDPOINT=https://login.preprod.dev.infomaniak.ch/
```

```shell
nvm use 16
yarn install
yarn workspace @mattermost/types build
yarn workspace @mattermost/client build
yarn workspace @mattermost/components build
export $(xargs < ./.env) && yarn build:webapp
```

## run the project

### new way (webpack server on your host)

```shell
npm run dev-server
```

Be sure to edit `/etc/hosts` file to add a record for your fake devd endpoint.

127.0.0.1 local.devdXXX.dev.infomaniak.ch

Then go on https://local.devdXXX.dev.infomaniak.ch:9005/

If you are redirected to the preprod, then check you are connected to the manager on your devd host (https://manager.devdXXX.dev.infomaniak.ch/v3).

### old way (docker/dev-local)

#### run the build

```shell
make build
npm run run
```

#### setup dev-local

`config-remote`

```yaml
SERVICES=(
  applications/ktalk/proxy-api
  applications/ktalk/webapp
)
```

`docker-compose.develop-remote.yml`

```yaml
version: '2.2'

services:
  proxy-api-ktalk:
    volumes:
      - /home/code/src/dev-local/container-config/ktalk/proxy-api-ktalk/000-default.conf:/etc/apache2/sites-available/000-default.conf
  ktalk-webapp:
    volumes:
      - /home/code/src/dev-local/container-config/ktalk/webapp/default.conf.template:/etc/nginx/templates/default.conf.template
      - /home/code/src/ktalk-webapp/dist:/var/www/static
```

Then go on https://ktalk.devdXXX.dev.infomaniak.ch

### Changelog
