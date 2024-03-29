# E2E testing for the Mattermost web client

This directory contains the E2E testing code for the Mattermost web client.

### How to run locally

##### For test case development

Please refer to the [dedicated developer documentation](https://developers.mattermost.com/contribute/more-info/webapp/e2e-testing/) for instructions.

##### For pipeline debugging

The E2E testing pipeline's scripts depend on the following tools being installed on your system: `docker`, `docker-compose`, `make`, `git`, `jq`, and some common utilities (`coreutils`, `findutils`, `bash`, `awk`, `sed`, `grep`)

Instructions, tl;dr: create a local branch with your E2E test changes, then open a PR to the `mattermost-server` repo targeting the `master` branch (so that CI will produce the image that docker-compose needs), then run `make` in this directory.

Instructions, detailed:
1. (optional, undefined variables are set to sane defaults) Create the `.ci/env` file, and populate it with the variables you need out of the following list:
  * The following variables will be passed over to the server container: `MM_LICENSE` (no enterprise features will be available if this is unset), and the exploded `MM_ENV` (a comma-separated list of env var specifications)
  * `TEST` either `cypress` (default) or `playwright`.
  * `SERVER` either `self-hosted` (default) or `cloud`.
  * The `ENABLED_DOCKER_SERVICES` is by default set to `postgres` and `inbucket` for smoke tests purpose, and for lightweight and faster start up time. Depending on the test requirement being worked on, you may want to override as needed, as such:
    * Cypress full tests require full services with `postgres`, `inbucket`, `minio`, `openldap`, `elasticsearch` and `keycloak`.
    * Cypress smoke tests require `postgres` and `inbucket` only.
    * Playwright full tests require `postgres` and `inbucket` only.
  * The following variables will be passed over to the cypress container: `BRANCH`, `BUILD_ID`, `CI_BASE_URL`, `BROWSER`, `AUTOMATION_DASHBOARD_URL` and `AUTOMATION_DASHBOARD_TOKEN`
  * The `SERVER_IMAGE` variable can also be set, if you want to select a custom mattermost-server image. If not specified, the value of the `SERVER_IMAGE_DEFAULT` variable defined in file `.ci/.e2erc` is used.
  * The `TEST_FILTER` variable can also be set, to customize which tests you want cypress to run. If not specified, only the smoke tests will run. Please check the `e2e-tests/cypress/run_tests.js` file for details about its format.
  * Set `CWS_URL` when spinning up a cloud-like test server that communicates with a test instance of customer web server. 
2. (optional) `make start-dashboard`: start the automation-dashboard in the background
  * This also sets the `AUTOMATION_DASHBOARD_URL` and `AUTOMATION_DASHBOARD_TOKEN` variables for the cypress container
  * Note that if you run the dashboard locally, but also specify other `AUTOMATION_DASHBOARD_*` variables in your `.ci/env` file, the latter variables will take precedence.
  * The dashboard is used for orchestrating specs with parallel test run and is typically used in CI.
  * Only Cypress is currently using the dashboard; Playwright is not.
3. Run the following commands to run with cypress:
  * `TEST=cypress make`: start and prepare the server, then run the cypress tests against self-hosted test server.
  * `TEST=cypress SERVER=cloud make`: create test customer for cloud, start and prepare the server, run the cypress tests against cloud-like test server, then delete the test customer. When anticipating a licensed test server, make sure the loaded license via `MM_LICENSE` is for cloud.
  * When anticipating a licensed test server, make sure the loaded license via `MM_LICENSE` does match either for self-hosted or cloud.
  * `CWS_URL` is required to be set for cloud test.
  * You can track the progress of the run in the `http://localhost:4000/cycles` dashboard, if you launched it locally.
4. Run the following commands to run with playwright:
  * `TEST=playwright make`: start and prepare the server, then run the playwright tests against self-hosted test server.
  * `TEST=playwright SERVER=cloud `: generate test customer for cloud, start and prepare the server, run the playwright tests against cloud-like test server, then delete the initially generated test customer.
  * When anticipating a licensed test server, make sure the loaded license via `MM_LICENSE` does match either for self-hosted or cloud.
  * `CWS_URL` is required to be set for cloud test.
5. `TEST=server make`: starts local server.
6. `make stop`: tears down the server (and the dashboard, if running), then cleans up the env placeholder files.

Notes:
- Setting a variable in `.ci/env` is functionally equivalent to exporting variables in your current shell's environment, before invoking the makefile.
- The `.ci/.env.*` files are auto generated by the pipeline scripts, and aren't meant to be modified manually. The only file you should edit to control the containers' environment is `.ci/env`, as specified in the instructions above.
- Aside from some exceptions (e.g. `TEST_FILTER`), most of the variables in `.ci/env` must be set before the `make start-server` command is run. Modifying that file afterwards has no effect, because the containers' env files are generated in that step.
- If you restart the dashboard at any point, you must also restart the server containers, so that it picks up the new IP of the dashboard from the newly generated `.env.dashboard` file
- If you started the dashboard locally in the past, but want to point to another dashboard later, you can run `make clean-env-placeholders` to remove references to the local dashboard (you'll likely need to restart the server)
- If new variables need to be passed to any of the containers:
  * If their value is fixed (e.g. a static server configuration), these may be simply added to the `docker_compose_generator.sh` file, to the appropriate container.
  * If you need to introduce variables that you want to control from `.ci/env`: you need to update the scripts under the `.ci/` dir, and configure them to write the new variables' values over to the appropriate `.env.*` file. In particular, avoid defining variables that depend on other variables within the docker-compose override files: this is to ensure uniformity in their availability, and simplifies the question of what container has access to which variable considerably.

##### For code changes:
* `make fmt-ci` to format and check yaml files and shell scripts.
