# kchat-webapp

Infomaniak fork of the mattermost web client modified to work with our internal API as part of the kSuite.

## Running the project

### Prerequisites

 - Node 16
 - Yarn

### Preprod Setup

| Type | Value |
|------|-------|
| **.env Variables** | WEBCOMPONENT_ENDPOINT=https://web-components.storage.infomaniak.com/current<br>WEBCOMPONENT_API_ENDPOINT=https://welcome.infomaniak.com<br>MANAGER_ENDPOINT=https://manager.infomaniak.com<br>LOGIN_ENDPOINT=https://login.infomaniak.com<br>SHOP_ENDPOINT=https://shop.infomaniak.com/ |
| **Hosts Entry** | 127.0.0.1 infomaniak.local.preprod.dev.infomaniak.ch |
| **Access URL** | http://infomaniak.local.preprod.dev.infomaniak.ch |

---

### Production Setup

| Type | Value |
|------|-------|
| **.env Variables** | MANAGER_ENDPOINT=https://manager.infomaniak.com/<br>LOGIN_ENDPOINT=https://login.infomaniak.com/<br>BASE_URL=https://infomaniak.kchat.infomaniak.com/<br>WEBCOMPONENT_ENDPOINT=https://web-components.storage.infomaniak.com/current<br>WEBCOMPONENT_API_ENDPOINT=https://welcome.infomaniak.com |
| **Hosts Entry** | 127.0.0.1 local.infomaniak.com |
| **Access URL** | [https://local.infomaniak.com](https://local.infomaniak.com) |

> ⚠️ Make sure to add an `NPM_TOKEN` environment variable with a GitHub token (scope: `read:packages`) before running the app.
> ⚠️ Updating hosts is mandatory for cookies to work properly.


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
