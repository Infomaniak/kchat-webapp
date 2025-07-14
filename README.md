# kchat-webapp

Infomaniak fork of the mattermost web client modified to work with our internal API as part of the kSuite.

:warning: This project is still in beta.

## Running the project

### Prerequisites

 - Node 16
 - Yarn

### Environment

Add an `NPM_TOKEN` env var with a Github token (read:packages scope)

Create a .env file with the following variables

```dotenv
WEBCOMPONENT_ENDPOINT=https://web-components.storage.infomaniak.com/current
WEBCOMPONENT_API_ENDPOINT=https://welcome.infomaniak.com
MANAGER_ENDPOINT=https://manager.infomaniak.com
LOGIN_ENDPOINT=https://login.infomaniak.com
SHOP_ENDPOINT=https://shop.infomaniak.com/
```

### Hosts

Modify your hosts file located at `/etc/hosts` and add this line : `127.0.0.1 infomaniak.local.preprod.dev.infomaniak.ch`

> Must be done, otherwise your application won't be able to read cookies set to infomaniak.com

### Installing and building dependencies

We are using yarn berry with workspace tools for monorepo support building and better module caching between builds

```shell
yarn
yarn workspace @infomaniak/mattermost-types build
yarn workspace @infomaniak/mattermost-client build
yarn workspace @mattermost/components build
```

### Running with webpack dev server

```shell
yarn dev-server:webapp
```

### Running prod build

```shell
yarn build:webapp
```
### Common errors
##### This error can occur when running a single test or a suite of tests
```shell
Cannot find module '../build/Release/canvas.node'
```
fix : 
```shell
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```
If problem persists (Require C++ compiler) :
```shell
yarn --cwd node_modules/canvas run install --build-from-source
```
