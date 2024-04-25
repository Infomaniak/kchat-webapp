// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ClientConfig, ClientLicense} from '@mattermost/types/config';

import AboutBuildModal from 'components/about_build_modal/about_build_modal';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';
import {AboutLinks} from 'utils/constants';

import AboutBuildModalCloud from './about_build_modal_cloud/about_build_modal_cloud';

describe('components/AboutBuildModal', () => {
    const RealDate: DateConstructor = Date;

    function mockDate(date: Date) {
        function mock() {
            return new RealDate(date);
        }
        mock.now = () => date.getTime();
        global.Date = mock as any;
    }

    let config: Partial<ClientConfig> = {};
    let license: ClientLicense = {};

    afterEach(() => {
        global.Date = RealDate;
        config = {};
        license = {};
    });

    beforeEach(() => {
        mockDate(new Date(2017, 6, 1));

        config = {
            BuildEnterpriseReady: 'true',
            Version: '3.6.0',
            SchemaVersion: '77',
            BuildNumber: '123456',
            SQLDriverName: 'Postgres',
            BuildHash: 'abcdef1234567890',
            BuildHashEnterprise: '0123456789abcdef',
            BuildDate: '21 January 2017',
            TermsOfServiceLink: AboutLinks.TERMS_OF_SERVICE,
            PrivacyPolicyLink: AboutLinks.PRIVACY_POLICY,
        };
        license = {
            IsLicensed: 'true',
            Company: 'Mattermost Inc',
        };
    });

    test('should match snapshot for enterprise edition', () => {
        renderAboutBuildModal({config, license});
        expect(screen.getByTestId('aboutModalVersion')).toHaveTextContent('Mattermost Version: 3.6.0');
        expect(screen.getByTestId('aboutModalDBVersionString')).toHaveTextContent('Database Schema Version: 77');
        expect(screen.getByTestId('aboutModalBuildNumber')).toHaveTextContent('Build Number: 123456');
        expect(screen.getByText('Mattermost Enterprise Edition')).toBeInTheDocument();
        expect(screen.getByText('Modern communication from behind your firewall.')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'mattermost.com'})).toHaveAttribute('href', 'https://mattermost.com/');
        expect(screen.getByText('EE Build Hash: 0123456789abcdef', {exact: false})).toBeInTheDocument();

        expect(screen.getByRole('link', {name: 'server'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-server/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'desktop'})).toHaveAttribute('href', 'https://github.com/mattermost/desktop/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'mobile'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-mobile/blob/master/NOTICE.txt');
    });

    test('should match snapshot for team edition', () => {
        const teamConfig = {
            ...config,
            BuildEnterpriseReady: 'false',
            BuildHashEnterprise: '',
        };

        renderAboutBuildModal({config: teamConfig, license: {}});
        expect(screen.getByTestId('aboutModalVersion')).toHaveTextContent('Mattermost Version: 3.6.0');
        expect(screen.getByTestId('aboutModalDBVersionString')).toHaveTextContent('Database Schema Version: 77');
        expect(screen.getByTestId('aboutModalBuildNumber')).toHaveTextContent('Build Number: 123456');
        expect(screen.getByText('Mattermost Team Edition')).toBeInTheDocument();
        expect(screen.getByText('All your team communication in one place, instantly searchable and accessible anywhere.')).toBeInTheDocument();
        expect(screen.queryByText('EE Build Hash: 0123456789abcdef')).not.toBeInTheDocument();

        expect(screen.getByRole('link', {name: 'server'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-server/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'desktop'})).toHaveAttribute('href', 'https://github.com/mattermost/desktop/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'mobile'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-mobile/blob/master/NOTICE.txt');
    });

    test('should match snapshot for cloud edition', () => {
        if (license !== null) {
            license.Cloud = 'true';
        }

        renderWithContext(
            <AboutBuildModalCloud
                config={config}
                license={license}
                show={true}
                onExited={jest.fn()}
                doHide={jest.fn()}
            />,
        );

        expect(screen.getByText('Mattermost Cloud')).toBeInTheDocument();
        expect(screen.getByText('High trust messaging for the enterprise')).toBeInTheDocument();
        expect(screen.getByTestId('aboutModalVersion')).toHaveTextContent('Mattermost Version: 3.6.0');
        expect(screen.getByText('0123456789abcdef', {exact: false})).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'server'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-server/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'desktop'})).toHaveAttribute('href', 'https://github.com/mattermost/desktop/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'mobile'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-mobile/blob/master/NOTICE.txt');
    });

    test('should show n/a if this is a dev build', () => {
        const sameBuildConfig = {
            ...config,
            BuildEnterpriseReady: 'false',
            BuildHashEnterprise: '',
            Version: '3.6.0',
            SchemaVersion: '77',
            BuildNumber: 'dev',
        };

        renderAboutBuildModal({config: sameBuildConfig, license: {}});

        expect(screen.getByTestId('aboutModalVersion')).toHaveTextContent('Mattermost Version: dev');
        expect(screen.getByTestId('aboutModalDBVersionString')).toHaveTextContent('Database Schema Version: 77');
        expect(screen.getByTestId('aboutModalBuildNumber')).toHaveTextContent('Build Number: n/a');
        expect(screen.getByText('Mattermost Team Edition')).toBeInTheDocument();
        expect(screen.getByText('All your team communication in one place, instantly searchable and accessible anywhere.')).toBeInTheDocument();
        expect(screen.queryByText('EE Build Hash: 0123456789abcdef')).not.toBeInTheDocument();

        expect(screen.getByRole('link', {name: 'server'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-server/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'desktop'})).toHaveAttribute('href', 'https://github.com/mattermost/desktop/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'mobile'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-mobile/blob/master/NOTICE.txt');
    });

    test('should call onExited callback when the modal is hidden', () => {
        const onExited = jest.fn();
        const state = {
            entities: {
                general: {
                    config: {},
                    license: {
                        Cloud: 'false',
                    },
                },
                users: {
                    currentUserId: 'currentUserId',
                },
            },
        };

        renderWithContext(
            <AboutBuildModal
                config={config}
                license={license}
                onExited={onExited}
            />,
            state,
        );

        userEvent.click(screen.getByText('Close'));
        expect(onExited).toHaveBeenCalledTimes(1);
    });

    test('should show default tos and privacy policy links and not the config links', () => {
        const state = {
            entities: {
                general: {
                    config: {},
                    license: {
                        Cloud: 'false',
                    },
                },
                users: {
                    currentUserId: 'currentUserId',
                },
            },
        };
        renderWithContext(
            <AboutBuildModal
                config={config}
                license={license}
                onExited={jest.fn()}
            />,
            state,
        );

        expect(screen.getByRole('link', {name: 'Terms of Use'})).toHaveAttribute('href', `${AboutLinks.TERMS_OF_SERVICE}`);

        expect(screen.getByRole('link', {name: 'Privacy Policy'})).toHaveAttribute('href', `${AboutLinks.PRIVACY_POLICY}`);

        // expect(screen.getByRole('link', {name: 'Terms of Use'})).not.toHaveAttribute('href', config?.TermsOfServiceLink);
        // expect(screen.getByRole('link', {name: 'Privacy Policy'})).not.toHaveAttribute('href', config?.PrivacyPolicyLink);
    });

    function renderAboutBuildModal(props = {}) {
        const onExited = jest.fn();
        const show = true;

        const allProps = {
            show,
            onExited,
            config,
            license,
            ...props,
        };

        return renderWithContext(<AboutBuildModal {...allProps}/>);
    }
});
