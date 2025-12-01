// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import crypto from 'crypto';
import {env} from 'process';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions';

import {ErrorPageTypes} from 'utils/constants';

import kSuite from 'images/ik/kSuite.svg';
import MattermostLogoSvg from 'images/logo.svg';
import loaderkChat from 'images/logo_compact.png';

import SvgIlluErrorBlocked from './assets/SvgIlluErrorBlocked';
import SvgIlluErrorMaintenance from './assets/SvgIlluErrorMaintenance';
import SvgIlluMigration from './assets/SvgIlluErrorMigration';
import SvgIlluErrorQuestion from './assets/SvgIlluErrorQuestion';
import ErrorMessage from './error_message';
import ErrorTitle from './error_title';

type Location = {
    search: string;
}

type Props = {
    location?: Location;
    asymmetricSigningPublicKey?: string;
    siteName?: string;
    isGuest?: boolean;
    isAdmin?: boolean;
    ikGroupId?: number;
    ikGroupName?: string;
}

export default class ErrorPage extends React.PureComponent<Props> {
    public componentDidMount() {
        document.body.setAttribute('class', 'sticky error');
    }

    public componentWillUnmount() {
        document.body.removeAttribute('class');
    }

    public renderHeader = () => {
        const header = (
            <div className='error-header'>
                <img
                    className='error-header__logo'
                    src={loaderkChat}
                    alt='kchat logo'
                />
                <div className='error-header__title'>
                    <img
                        className='error-header__ik-logo'
                        src={MattermostLogoSvg}
                        alt='infomaniak logo'
                    />
                    {'kChat'}
                </div>
            </div>
        );

        return header;
    };

    restoreAutologRight() {
        const base = env.MANAGER_ENDPOINT;

        console.log('🚀 ~ ErrorPage ~ restoreAutologRight ~ base:', base);
        const path = '/v3/api/app/autologout';

        console.log('🚀 ~ ErrorPage ~ restoreAutologRight ~ path:', path);
        const url = new URL(path, base);

        console.log('🚀 ~ ErrorPage ~ restoreAutologRight ~ url:', url);

        fetch(url.toString()).then(() => {
            window.location.assign(window.location.origin);
        });
    }

    public render() {
        const {isGuest, isAdmin, ikGroupId, ikGroupName} = this.props;
        const params: URLSearchParams = new URLSearchParams(this.props.location ? this.props.location.search : '');
        const signature = params.get('s');
        let customClasses = '';
        const reloadPage = () => {
            if (window && window.location) {
                window.location.assign(window.location.origin);
            }
        };

        const goToAppStore = () => {
            window.open('https://apps.apple.com/app/infomaniak-kchat/id6443845553', '_blank');
        };

        let trustParams = false;
        if (signature) {
            params.delete('s');

            const key = this.props.asymmetricSigningPublicKey;
            const keyPEM = '-----BEGIN PUBLIC KEY-----\n' + key + '\n-----END PUBLIC KEY-----';

            const verify = crypto.createVerify('sha256');
            verify.update('/error?' + params.toString());
            trustParams = verify.verify(keyPEM, signature, 'base64');
        }

        const type = params.get('type');
        const title = (trustParams && params.get('title')) || '';
        const message = (trustParams && params.get('message')) || '';
        const service = (trustParams && params.get('service')) || '';
        const returnTo = (trustParams && params.get('returnTo')) || '';

        let backButton;
        let secondaryButton;
        let illustration: JSX.Element | null = <SvgIlluErrorQuestion/>;
        const illustrationMigration: JSX.Element | null = <SvgIlluMigration/>;
        let fullscreenIllustration;
        if (type === ErrorPageTypes.PERMALINK_NOT_FOUND) {
            if (returnTo) {
                backButton = (
                    <Link
                        className='btn btn-primary'
                        to={returnTo}
                    >
                        <FormattedMessage
                            id='error.generic.back'
                            defaultMessage='Back'
                        />
                    </Link>
                );
            } else {
                backButton = (
                    <button
                        className='btn btn-primary'
                        onClick={() => {
                            window.location.href = '/';
                        }}
                    >
                        <FormattedMessage
                            id='error.generic.back'
                            defaultMessage='Back'
                        />
                    </button>
                );
            }
        } else if (type === ErrorPageTypes.CLOUD_ARCHIVED && returnTo) {
            backButton = (
                <Link to={returnTo}>
                    <FormattedMessage
                        id='error.generic.back'
                        defaultMessage='Back'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.TEAM_NOT_FOUND) {
            backButton = (
                <a
                    className='btn btn-primary'
                    onClick={GlobalActions.redirectToKSuite}
                >
                    <FormattedMessage
                        id='error.generic.link_ksuite'
                        defaultMessage='Add kSuite'
                        values={{
                            siteName: this.props.siteName,
                        }}
                    />
                </a>
            );
        } else if (type === ErrorPageTypes.CHANNEL_NOT_FOUND && isGuest) {
            backButton = (
                <Link
                    className='btn btn-primary'
                    to='/'
                >
                    <FormattedMessage
                        id='error.channelNotFound.guest_link'
                        defaultMessage='Back'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.CHANNEL_NOT_FOUND) {
            backButton = (
                <Link
                    className='btn btn-primary'
                    to={params.get('returnTo') as string}
                >
                    <FormattedMessage
                        id='error.channelNotFound.link'
                        defaultMessage='Back to {defaultChannelName}'
                        values={{
                            defaultChannelName: 'kChat',
                        }}
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.MAINTENANCE) {
            illustration = <SvgIlluErrorMaintenance/>;
            if (isAdmin && ikGroupId) {
                backButton = (
                    <a
                        className='btn btn-primary'
                        onClick={() => reloadPage()}
                    >
                        <FormattedMessage
                            id='error.generic.reload'
                            defaultMessage='Reload page'

                        />
                    </a>
                );
            } else {
                backButton = (
                    <a
                        className='btn btn-primary'
                        onClick={() => reloadPage()}
                    >
                        <FormattedMessage
                            id='error.generic.reload'
                            defaultMessage='Reload page'

                        />
                    </a>
                );
            }
        } else if (type === ErrorPageTypes.NO_KSUITE) {
            illustration = null;
            customClasses = 'no-kSuite';
            fullscreenIllustration = (
                <div className='error__fullscreen-graphic'>
                    <img
                        src={kSuite}
                        alt='log ksuite'
                    />
                </div>
            );
            backButton = (
                <a
                    className='btn btn-primary'
                    onClick={GlobalActions.redirectToKSuite}
                >
                    <FormattedMessage
                        id='navbar_dropdown.kSuite'
                        defaultMessage='Discover kSuite'
                    />
                </a>
            );
        } else if (type === ErrorPageTypes.BLOCKED) {
            illustration = <SvgIlluErrorBlocked/>;
            if (isAdmin && ikGroupId) {
                backButton = (
                    <a
                        className='btn btn-primary'
                        onClick={() => reloadPage()}
                    >
                        <FormattedMessage
                            id='error.generic.reload'
                            defaultMessage='Reload page'

                        />
                    </a>
                );
                secondaryButton = (
                    <a
                        className='btn-secondary'
                        onClick={() => GlobalActions.redirectToManagerDashboard(ikGroupId)}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.dashboard'
                            defaultMessage='Tableau de bord'
                        />
                    </a>
                );
            } else {
                backButton = (
                    <a
                        className='btn btn-primary'
                        onClick={() => reloadPage()}
                    >
                        <FormattedMessage
                            id='error.generic.reload'
                            defaultMessage='Reload page'

                        />
                    </a>
                );
            }
        } else if (type === ErrorPageTypes.AUTOLOG_BLOCKED) {
            illustration = <SvgIlluErrorBlocked/>;
            backButton = (
                <a
                    className='btn btn-primary'
                    onClick={() => reloadPage()}
                >
                    <FormattedMessage
                        id='error.generic.reload'
                        defaultMessage='Reload page'

                    />
                </a>
            );

            secondaryButton = (
                <a
                    className='btn-secondary'
                    onClick={this.restoreAutologRight}
                >
                    <FormattedMessage
                        id='error.autolog.restore'
                        defaultMessage='Restore my rights'
                    />
                </a>
            );
        } else if (type === ErrorPageTypes.OAUTH_ACCESS_DENIED || type === ErrorPageTypes.OAUTH_MISSING_CODE) {
            backButton = (
                <Link
                    className='btn btn-primary'
                    to='/'
                >
                    <FormattedMessage
                        id='error.generic.link_login'
                        defaultMessage='Back to Login Page'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.OAUTH_INVALID_PARAM || type === ErrorPageTypes.OAUTH_INVALID_REDIRECT_URL) {
            backButton = null;
        } else if (type === ErrorPageTypes.PAGE_NOT_FOUND && ikGroupId) {
            backButton = (
                <a
                    className='btn btn-primary'
                    onClick={() => GlobalActions.redirectToManagerDashboard(ikGroupId)}
                >
                    <FormattedMessage
                        id='navbar_dropdown.dashboard'
                        defaultMessage='Tableau de bord'
                    />
                </a>
            );
        } else if (type === ErrorPageTypes.FORCE_MIGRATION) {
            illustration = illustrationMigration;
            backButton = (
                <a
                    className='btn btn-primary'
                    onClick={goToAppStore}
                >
                    <FormattedMessage
                        id='error.generic.dl_link'
                        defaultMessage='Download the new version'

                    />
                </a>
            );
        } else {
            backButton = (
                <a
                    className='btn btn-primary'
                    onClick={() => reloadPage()}
                >
                    <FormattedMessage
                        id='error.generic.reload'
                        defaultMessage='Reload page'

                    />
                </a>
            );
        }

        const errorPage = (
            <div className={`error-page ${customClasses}`}>
                {this.renderHeader()}
                <div className='error__content'>
                    {fullscreenIllustration}
                    <div className='error__dialog'>
                        <div className='error__dialog-body'>
                            <h1
                                data-testid='errorMessageTitle'
                                className='error__dialog-title mb-4'
                            >
                                <ErrorTitle
                                    type={type}
                                    title={title}
                                    groupName={ikGroupName}
                                />
                            </h1>
                            <ErrorMessage
                                type={type}
                                message={message}
                                service={service}
                                isGuest={isGuest}
                            />
                            <div className='error__dialog-btns mt-8'>
                                {backButton}
                                {secondaryButton}
                            </div>
                        </div>
                        <div className='error__graphic'>
                            {illustration}
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <>
                {errorPage}
            </>
        );
    }
}
