# ktalk-webapp

## install + watch

```shell
nvm use 16
npm install
npm run run
```

## dev-local

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
