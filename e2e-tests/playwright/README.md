## Local development

#### 1. Start local server in a separate terminal.

```
# Typically run the local server with:
cd server && make run

# Or build and distribute webapp including channels and playbooks
# so that their product URLs do not rely on Webpack dev server.
# Especially important when running test inside the Playwright's docker container.
cd webapp && make dist
cd server && make run-server
```

#### 2. Install dependencies and run the test.

Note: If you're using Node.js version 18 and above, you may need to set `NODE_OPTIONS='--no-experimental-fetch'`.

```
# Install npm packages
npm i

# Install browser binaries as prompted if Playwright is just installed or updated
# See https://playwright.dev/docs/browsers
npx playwright install

# Run specific test of all projects -- chrome, firefox, iphone and ipad.
# See https://playwright.dev/docs/test-cli.
npm run test -- login

# Run specific test of a project
npm run test -- login --project=chrome

# Or run all tests
npm run test
```

#### 3. Inspect test results at `/test-results` folder when something failed unexpectedly.

## Updating screenshots is strictly via Playwright's docker container for consistency

#### 1. Run docker container using latest focal version

Change to the root directory, then run the docker container. (See https://playwright.dev/docs/docker for reference.)

```
docker run -it --rm -v "$(pwd):/mattermost/" --ipc=host mcr.microsoft.com/playwright:v1.49.1-noble /bin/bash
```

#### 2. Inside the docker container

```
export NPM_TOKEN=[REPLACE_ME]
export NODE_OPTIONS='--no-experimental-fetch'
export PW_HEADLESS=true

# Install packages. Use "--immutable" to match the automated environment
yarn --immutable

# Run specific test. See https://playwright.dev/docs/test-cli.
yarn test -- login --project=chrome

# Or run all tests
yarn test

# Update snapshots
yarn workspace e2e-playwright test:update-snapshots
```

## Page/Component Object Model

See https://playwright.dev/docs/test-pom.

Page and component abstractions are located at `./support/ui`. It should be first class before writing a spec file so that any future change in DOM structure will be done in one place only. No static UI text and fixed locator should be written in the spec file.
