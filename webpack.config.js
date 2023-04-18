// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable max-lines */
/* eslint-disable no-process-env */

/* eslint-disable no-console, no-process-env */

const childProcess = require('child_process');
const http = require('http');
const https = require('https');
const path = require('path');

const url = require('url');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const webpack = require('webpack');
const {ModuleFederationPlugin} = require('webpack').container;
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const packageJson = require('./package.json');

const NPM_TARGET = process.env.npm_lifecycle_event;

const targetIsRun = NPM_TARGET?.startsWith('run');
const targetIsTest = NPM_TARGET === 'test';
const targetIsStats = NPM_TARGET === 'stats';
const targetIsDevServer = NPM_TARGET?.startsWith('dev-server');
const targetIsEslint = NPM_TARGET === 'check' || NPM_TARGET === 'fix' || process.env.VSCODE_CWD;

const DEV = targetIsRun || targetIsStats || targetIsDevServer;

const boardsDevServerUrl = process.env.MM_BOARDS_DEV_SERVER_URL ?? 'http://localhost:9006';

const STANDARD_EXCLUDE = [
    path.join(__dirname, 'node_modules'),
    path.join(__dirname, 'service-worker.js'),
    path.join(__dirname, 'packages/components'),
];

const CSP_UNSAFE_EVAL_IF_DEV = ' \'unsafe-eval\'';
const CSP_UNSAFE_INLINE = ' \'unsafe-inline\'';
const CSP_WORKER_SRC = ' \'worker-src\'';

var MYSTATS = {

    // Add asset Information
    assets: false,

    // Sort assets by a field
    assetsSort: '',

    // Add information about cached (not built) modules
    cached: true,

    // Show cached assets (setting this to `false` only shows emitted files)
    cachedAssets: true,

    // Add children information
    children: true,

    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: true,

    // Add built modules information to chunk information
    chunkModules: true,

    // Add the origins of chunks and chunk merging info
    chunkOrigins: true,

    // Sort the chunks by a field
    chunksSort: '',

    // `webpack --colors` equivalent
    colors: true,

    // Display the distance from the entry point for each module
    depth: true,

    // Display the entry points with the corresponding bundles
    entrypoints: true,

    // Add errors
    errors: true,

    // Add details to errors (like resolving log)
    errorDetails: true,

    // Exclude modules which match one of the given strings or regular expressions
    exclude: [],

    // Add the hash of the compilation
    hash: true,

    // Add built modules information
    modules: false,

    // Sort the modules by a field
    modulesSort: '!size',

    // Show performance hint when file size exceeds `performance.maxAssetSize`
    performance: true,

    // Show the exports of the modules
    providedExports: true,

    // Add public path information
    publicPath: true,

    // Add information about the reasons why modules are included
    reasons: true,

    // Add the source code of modules
    source: true,

    // Add timing information
    timings: true,

    // Show which exports of a module are used
    usedExports: true,

    // Add webpack version information
    version: true,

    // Add warnings
    warnings: false,

    // Filter warnings to be shown (since webpack 2.4.0),
    // can be a String, Regexp, a function getting the warning and returning a boolean
    // or an Array of a combination of the above. First match wins.
    warningsFilter: '',
};

let publicPath = '/static/';

// Allow overriding the publicPath in dev from the exported SiteURL.
if (DEV) {
    const siteURL = process.env.MM_SERVICESETTINGS_SITEURL || '';
    if (siteURL) {
        publicPath = path.join(new url.URL(siteURL).pathname, 'static') + '/';
    }
}

// Track the build time so that we can bust any caches that may have incorrectly cached remote_entry.js from before we
// started setting Cache-Control: no-cache for that file on the server. This can be removed in 2024 after those cached
// entries are guaranteed to have expired.
const buildTimestamp = Date.now();

var config = {
    entry: ['./root.tsx', 'root.html.ejs'],
    output: {
        publicPath,
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js',
        clean: true,
    },
    devtool: 'source-map',
    stats: {
        warnings: false,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: STANDARD_EXCLUDE,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,

                        // Babel configuration is in .babelrc because jest requires it to be there.
                    },
                },
            },
            {
                type: 'javascript/auto',
                test: /\.json$/,
                include: [
                    path.resolve(__dirname, 'i18n'),
                ],
                exclude: [/en\.json$/],
                use: [
                    {
                        loader: 'file-loader?name=i18n/[name].[contenthash].[ext]',
                    },
                ],
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: ['sass'],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(png|eot|tiff|svg|woff2|woff|ttf|gif|mp3|jpg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'files/[contenthash].[ext]',
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {},
                    },
                ],
            },
            {
                test: /\.apng$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'files/[contenthash].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            sources: false,
                        },
                    },
                ],
            },
            {
                test: /\.ejs$/,
                use: [
                    {
                        loader: 'ejs-compiled-loader',
                        options: {
                            htmlmin: true,
                            htmlminOptions: {
                                removeComments: true,
                            },
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname),
        ],
        alias: {
            'mattermost-redux/test': 'packages/mattermost-redux/test',
            'mattermost-redux': 'packages/mattermost-redux/src',
            reselect: 'packages/reselect/src',
            marked: '@infomaniak/marked',
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
        },
    },
    performance: {
        hints: 'warning',
    },
    target: 'web',
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            crypto: 'crypto-browserify',
        }),
        new webpack.DefinePlugin({
            COMMIT_HASH: JSON.stringify(childProcess.execSync('git rev-parse HEAD || echo dev').toString()),
            GIT_RELEASE: JSON.stringify(childProcess.execSync('git describe --tags --abbrev=0').toString()),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[name].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'root.html',
            inject: 'head',
            template: 'root.html.ejs',
            meta: {
                csp: {
                    'http-equiv': 'Content-Security-Policy',
                    content: 'script-src \'self\' blob: cdn.rudderlabs.com/ js.stripe.com/v3 web-components.storage.infomaniak.com/ welcome.infomaniak.com/ welcome.preprod.dev.infomaniak.ch/ kmeet.infomaniak.com/ kmeet.preprod.dev.infomaniak.ch/ ' + CSP_UNSAFE_EVAL_IF_DEV,
                },
            },
            templateParameters: {
                // eslint-disable-next-line no-process-env
                WEBCOMPONENT_ENDPOINT: process.env.WEBCOMPONENT_ENDPOINT, // || 'https://web-components.storage.infomaniak.com/current',
                // eslint-disable-next-line no-process-env
                WEBCOMPONENT_API_ENDPOINT: process.env.WEBCOMPONENT_API_ENDPOINT, // || 'https://welcome.infomaniak.com',
            },
        }),
        new HtmlWebpackPlugin({
            filename: 'call.html',
            inject: 'head',
            template: 'call.html.ejs',
            meta: {
                csp: {
                    'http-equiv': 'Content-Security-Policy',
                    content: generateCSP(),
                },
            },
            templateParameters: {
                // eslint-disable-next-line no-process-env
                KMEET_ENDPOINT: process.env.KMEET_ENDPOINT || 'https://kmeet.preprod.dev.infomaniak.ch/',
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: 'images/emoji', to: 'emoji'},
                {from: 'images/worktemplates', to: 'worktemplates'},
                {from: 'images/img_trans.gif', to: 'images'},
                {from: 'images/logo-email.png', to: 'images'},
                {from: 'images/circles.png', to: 'images'},
                {from: 'images/favicon', to: 'images/favicon'},
                {from: 'images/appIcons.png', to: 'images'},
                {from: 'images/warning.png', to: 'images'},
                {from: 'images/logo-email.png', to: 'images'},
                {from: 'images/browser-icons', to: 'images/browser-icons'},
                {from: 'images/cloud', to: 'images'},
                {from: 'images/welcome_illustration_new.png', to: 'images'},
                {from: 'images/logo_email_blue.png', to: 'images'},
                {from: 'images/logo_email_dark.png', to: 'images'},
                {from: 'images/logo_email_gray.png', to: 'images'},
                {from: 'images/forgot_password_illustration.png', to: 'images'},
                {from: 'images/invite_illustration.png', to: 'images'},
                {from: 'images/channel_icon.png', to: 'images'},
                {from: 'images/add_payment_method.png', to: 'images'},
                {from: 'images/add_subscription.png', to: 'images'},
                {from: 'images/c_avatar.png', to: 'images'},
                {from: 'images/c_download.png', to: 'images'},
                {from: 'images/c_socket.png', to: 'images'},
                {from: 'images/admin-onboarding-background.jpg', to: 'images'},
                {from: 'images/payment-method-illustration.png', to: 'images'},
                {from: 'images/cloud-laptop.png', to: 'images'},
                {from: 'images/bot_default_icon.png', to: 'images'},
                {from: 'images/cloud-laptop-error.png', to: 'images'},
                {from: 'images/cloud-laptop-warning.png', to: 'images'},
                {from: 'images/cloud-upgrade-person-hand-to-face.png', to: 'images'},
            ],
        }),

        // Generate manifest.json, honouring any configured publicPath. This also handles injecting
        // <link rel="apple-touch-icon" ... /> and <meta name="apple-*" ... /> tags into root.html.
        new WebpackPwaManifest({
            name: 'kChat',
            short_name: 'kChat',
            start_url: '..',
            description: 'Infomaniak kChat',
            background_color: '#ffffff',
            inject: true,
            ios: true,
            fingerprints: false,
            orientation: 'any',
            filename: 'manifest.json',
            icons: [{
                src: path.resolve('images/favicon/android-chrome-192x192.png'),
                type: 'image/png',
                sizes: '192x192',
            }, {
                src: path.resolve('images/favicon/apple-touch-icon-120x120.png'),
                type: 'image/png',
                sizes: '120x120',
                ios: true,
            }, {
                src: path.resolve('images/favicon/apple-touch-icon-144x144.png'),
                type: 'image/png',
                sizes: '144x144',
                ios: true,
            }, {
                src: path.resolve('images/favicon/apple-touch-icon-152x152.png'),
                type: 'image/png',
                sizes: '152x152',
                ios: true,
            }, {
                src: path.resolve('images/favicon/apple-touch-icon-57x57.png'),
                type: 'image/png',
                sizes: '57x57',
                ios: true,
            }, {
                src: path.resolve('images/favicon/apple-touch-icon-60x60.png'),
                type: 'image/png',
                sizes: '60x60',
                ios: true,
            }, {
                src: path.resolve('images/favicon/apple-touch-icon-72x72.png'),
                type: 'image/png',
                sizes: '72x72',
                ios: true,
            }, {
                src: path.resolve('images/favicon/apple-touch-icon-76x76.png'),
                type: 'image/png',
                sizes: '76x76',
                ios: true,
            }, {
                src: path.resolve('images/favicon/favicon-16x16.png'),
                type: 'image/png',
                sizes: '16x16',
            }, {
                src: path.resolve('images/favicon/favicon-32x32.png'),
                type: 'image/png',
                sizes: '32x32',
            }, {
                src: path.resolve('images/favicon/favicon-96x96.png'),
                type: 'image/png',
                sizes: '96x96',
            }],
        }),

        // Disabling this plugin until we come up with better bundle analysis ci
        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'disabled',
        //     generateStatsFile: true,
        //     statsFilename: 'bundlestats.json',
        // }),
    ],
};

function generateCSP() {
    let csp = 'script-src \'self\' blob: cdn.rudderlabs.com/ js.stripe.com/v3 web-components.storage.infomaniak.com/ welcome.infomaniak.com/ welcome.preprod.dev.infomaniak.ch/ kmeet.infomaniak.com/ welcome.preprod.dev.infomaniak.ch/ kmeet.preprod.dev.infomaniak.ch/ ' + CSP_UNSAFE_INLINE + CSP_UNSAFE_EVAL_IF_DEV;

    // if (DEV) {
    //     // react-hot-loader and development source maps require eval
    //     csp += ' \'unsafe-eval\'';

    //     csp += ' ' + boardsDevServerUrl;
    // }

    return csp;
}

async function initializeModuleFederation() {
    function makeSharedModules(packageNames, singleton) {
        const sharedObject = {};

        for (const packageName of packageNames) {
            const version = packageJson.dependencies[packageName];

            sharedObject[packageName] = {

                // Ensure only one copy of this package is ever loaded
                singleton,

                // Setting this to true causes the app to error out if the required version is not satisfied
                strictVersion: singleton,

                // Set these to match the specific version that the web app includes
                requiredVersion: singleton ? version : undefined,
                version,
            };
        }

        return sharedObject;
    }

    function isWebpackDevServerAvailable(baseUrl) {
        return new Promise((resolve) => {
            if (!DEV) {
                resolve(false);
                return;
            }

            const requestModule = baseUrl.startsWith('https:') ? https : http;
            const req = requestModule.request(`${baseUrl}/remote_entry.js`, (response) => {
                return resolve(response.statusCode === 200);
            });

            req.setTimeout(100, () => {
                // If this times out, we've connected to the dev server even if it's not ready yet
                resolve(true);
            });

            req.on('error', () => {
                resolve(false);
            });

            req.end();
        });
    }

    async function getRemoteContainers() {
        const products = [
            {name: 'boards', baseUrl: boardsDevServerUrl},
        ];

        const remotes = {};

        if (process.env.MM_DONT_INCLUDE_PRODUCTS) {
            console.warn('Skipping initialization of products');
        } else if (DEV) {
            // For development, identify which product dev servers are available

            // Wait for 5 seconds for product dev servers to start up if they were started at the same time as this one
            await new Promise((resolve) => setTimeout(resolve, 5000));

            const productsFound = await Promise.all(products.map((product) => isWebpackDevServerAvailable(product.baseUrl)));
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                const found = productsFound[i];

                if (found) {
                    console.log(`Product ${product.name} found at ${product.baseUrl}, adding as remote module`);

                    remotes[product.name] = `${product.name}@${product.baseUrl}/remote_entry.js`;
                } else {
                    console.log(`Product ${product.name} not found at ${product.baseUrl}`);
                }
            }
        } else {
            // For production, hardcode the URLs of product containers to be based on the web app URL
            for (const product of products) {
                remotes[product.name] = `${product.name}@[window.basename]/static/products/${product.name}/remote_entry.js?bt=${buildTimestamp}`;
            }
        }

        const aliases = {};

        for (const product of products) {
            if (remotes[product.name]) {
                continue;
            }

            // Add false aliases to prevent Webpack from trying to resolve the missing modules
            aliases[product.name] = false;
            aliases[`${product.name}/manifest`] = false;
        }

        return {remotes, aliases};
    }

    const {remotes, aliases} = await getRemoteContainers();

    const moduleFederationPluginOptions = {
        name: 'mattermost_webapp',
        remotes,
        shared: [

            // Shared modules will be made available to other containers (ie products and plugins using module federation).
            // To allow for better sharing, containers shouldn't require exact versions of packages like the web app does.

            // Other containers will use these shared modules if their required versions match. If they don't match, the
            // version packaged with the container will be used.
            makeSharedModules([
                '@mattermost/client',
                '@mattermost/components',
                '@mattermost/types',
                'luxon',
                'prop-types',
            ], false),

            // Other containers will be forced to use the exact versions of shared modules that the web app provides.
            makeSharedModules([
                'history',
                'react',
                'react-beautiful-dnd',
                'react-bootstrap',
                'react-dom',
                'react-intl',
                'react-redux',
                'react-router-dom',
                'styled-components',
            ], true),
        ],
    };

    // Desktop specific code for remote module loading
    moduleFederationPluginOptions.exposes = {
        './app': 'components/app.jsx',
        './store': 'stores/redux_store.jsx',
        './styles': './sass/styles.scss',
        './registry': 'module_registry',
    };
    moduleFederationPluginOptions.filename = `remote_entry.js?bt=${buildTimestamp}`;

    config.plugins.push(new ModuleFederationPlugin(moduleFederationPluginOptions));

    // Add this plugin to perform the substitution of window.basename when loading remote containers
    config.plugins.push(new ExternalTemplateRemotesPlugin());

    config.resolve.alias = {
        ...config.resolve.alias,
        ...aliases,
    };

    config.plugins.push(new webpack.DefinePlugin({
        REMOTE_CONTAINERS: JSON.stringify(remotes),
    }));
}

if (DEV) {
    // Development mode configuration
    config.mode = 'development';
    config.devtool = 'eval-cheap-module-source-map';
} else {
    // Production mode configuration
    config.mode = 'production';
    config.devtool = 'source-map';
}

// const env = {};
// if (DEV) {
//     env.PUBLIC_PATH = JSON.stringify(publicPath);
//     env.RUDDER_KEY = JSON.stringify(process.env.RUDDER_KEY || '');
//     env.RUDDER_DATAPLANE_URL = JSON.stringify(process.env.RUDDER_DATAPLANE_URL || '');
//     if (process.env.MM_LIVE_RELOAD) {
//         config.plugins.push(new LiveReloadPlugin());
//     }
// } else {
//     env.NODE_ENV = JSON.stringify('production');
//     env.RUDDER_KEY = JSON.stringify(process.env.RUDDER_KEY || '');
//     env.RUDDER_DATAPLANE_URL = JSON.stringify(process.env.RUDDER_DATAPLANE_URL || '');
// }

const env = {};
if (DEV) {
    env.PUBLIC_PATH = JSON.stringify(publicPath);
    env.RUDDER_KEY = JSON.stringify(process.env.RUDDER_KEY || '');
    env.RUDDER_DATAPLANE_URL = JSON.stringify(process.env.RUDDER_DATAPLANE_URL || '');
    env.WEBCOMPONENT_ENDPOINT = JSON.stringify(process.env.WEBCOMPONENT_ENDPOINT || 'https://web-components.storage.infomaniak.com/next');
    env.WEBCOMPONENT_API_ENDPOINT = JSON.stringify(process.env.WEBCOMPONENT_API_ENDPOINT || 'https://welcome.preprod.dev.infomaniak.ch');
    env.KMEET_ENDPOINT = JSON.stringify(process.env.KMEET_ENDPOINT || 'https://kmeet.preprod.dev.infomaniak.ch/');
    env.MANAGER_ENDPOINT = JSON.stringify(process.env.MANAGER_ENDPOINT || 'https://manager.preprod.dev.infomaniak.ch/');
    env.LOGIN_ENDPOINT = JSON.stringify(process.env.LOGIN_ENDPOINT || 'https://login.preprod.dev.infomaniak.ch/');
    env.BASE_URL = JSON.stringify(process.env.BASE_URL || 'https://kchat.preprod.dev.infomaniak.ch');
    if (process.env.MM_LIVE_RELOAD) {
        config.plugins.push(new LiveReloadPlugin());
    }
} else {
    env.NODE_ENV = JSON.stringify('production');
    env.RUDDER_KEY = JSON.stringify(process.env.RUDDER_KEY || '');
    env.RUDDER_DATAPLANE_URL = JSON.stringify(process.env.RUDDER_DATAPLANE_URL || '');
    env.WEBCOMPONENT_ENDPOINT = JSON.stringify(process.env.WEBCOMPONENT_ENDPOINT || 'https://web-components.storage.infomaniak.com/next');
    env.WEBCOMPONENT_API_ENDPOINT = JSON.stringify(process.env.WEBCOMPONENT_API_ENDPOINT || 'https://welcome.infomaniak.com');
    env.KMEET_ENDPOINT = JSON.stringify(process.env.KMEET_ENDPOINT || 'https://kmeet.infomaniak.com/');
    env.MANAGER_ENDPOINT = JSON.stringify(process.env.MANAGER_ENDPOINT || 'https://manager.infomaniak.com/');
    env.LOGIN_ENDPOINT = JSON.stringify(process.env.LOGIN_ENDPOINT || 'https://login.infomaniak.com/');
    env.BASE_URL = JSON.stringify(process.env.BASE_URL || 'https://kchat.infomaniak.com');
}

config.plugins.push(new webpack.DefinePlugin({
    'process.env': env,
}));

if (!targetIsStats) {
    config.stats = MYSTATS;
}

// Test mode configuration
if (targetIsTest) {
    config.entry = ['./root.tsx'];
    config.target = 'node';
    config.externals = [nodeExternals()];
}

if (targetIsDevServer) {
    const proxyToServer = {
        logLevel: 'silent',
        target: process.env.MM_SERVICESETTINGS_SITEURL ?? 'http://localhost:8065',
        xfwd: true,
    };

    config = {
        ...config,
        devtool: 'eval-cheap-module-source-map',
        devServer: {
            server: 'https',
            allowedHosts: 'all',
            liveReload: true,
            proxy: [{
                context: () => true,
                bypass(req) {
                    if (req.url.indexOf('/api') === 0 ||
                        req.url.indexOf('/plugins') === 0 ||
                        req.url.indexOf('/static/plugins/') === 0 ||
                        req.url.indexOf('/broadcasting/auth') === 0 ||
                        req.url.indexOf('/sockjs-node/') !== -1) {
                        return null; // send through proxy to the server
                    }
                    if (req.url.indexOf('/static/') === 0) {
                        return path; // return the webpacked asset
                    }

                    // redirect (root, team routes, etc)
                    return '/static/root.html';
                },
                logLevel: 'silent',
                target: process.env.BASE_URL || 'https://infomaniak.kchat.infomaniak.com/', //eslint-disable-line no-process-env
                changeOrigin: true,
                xfwd: true,
                ws: false,
            }],
            port: 9005,
            devMiddleware: {
                writeToDisk: false,
            },
            historyApiFallback: {
                index: '/static/root.html',
            },
            client: {
                overlay: false,
            },
        },
        performance: false,
        optimization: {
            ...config.optimization,
            splitChunks: false,
        },
        resolve: {
            ...config.resolve,
            alias: {
                ...config.resolve.alias,
                'react-dom': '@hot-loader/react-dom',
            },
        },
    };
}

// Export PRODUCTION_PERF_DEBUG=1 when running webpack to enable support for the react profiler
// even while generating production code. (Performance testing development code is typically
// not helpful.)
// See https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html and
// https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977
if (process.env.PRODUCTION_PERF_DEBUG) {
    console.log('Enabling production performance debug settings'); //eslint-disable-line no-console
    config.resolve.alias['react-dom'] = 'react-dom/profiling';
    config.resolve.alias['schedule/tracing'] = 'schedule/tracing-profiling';
    config.optimization = {

        // Skip minification to make the profiled data more useful.
        minimize: false,
    };
}

if (targetIsEslint) {
    // ESLint can't handle setting an async config, so just skip the async part
    module.exports = config;
} else {
    module.exports = async () => {
        // Do this asynchronously so we can determine whether which remote modules are available
        await initializeModuleFederation();

        return config;
    };
}
