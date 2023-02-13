# kchat-webapp

Infomaniak fork of the mattermost web client modified to work with our internal API as part of the kSuite.

:warning: This project is still in beta.    

## Running the project

### Prerequisites

 - Node 16
 - Yarn

### Environment

Create a .env file with the following variables

```dotenv
WEBCOMPONENT_ENDPOINT=https://web-components.storage.infomaniak.com/current
WEBCOMPONENT_API_ENDPOINT=https://welcome.infomaniak.com
MANAGER_ENDPOINT=https://manager.infomaniak.com
LOGIN_ENDPOINT=https://login.infomaniak.com
```

### Installing and building dependencies

We are using yarn berry with workspace tools for monorepo support building and better module caching between builds

```shell
yarn
yarn workspace @mattermost/types build
yarn workspace @mattermost/client build
yarn workspace @mattermost/components build
```

### Running with webpack dev server

```shell
export $(xargs < ./.env) && yarn dev-server:webapp
```

### Running prod build

```shell
export $(xargs < ./.env) && yarn build:webapp
```
