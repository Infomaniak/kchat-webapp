// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import {createIntl} from 'react-intl';
import {Provider} from 'react-redux';

import {Permissions} from 'mattermost-redux/constants';

import Menu from 'components/widgets/menu/menu';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import mockStore from 'tests/test_store';
import {Constants} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import type {Props} from './main_menu';
import {MainMenu} from './main_menu';

describe('components/Menu', () => {
    // Neccessary for components enhanced by HOCs due to issue with enzyme.
    // See https://github.com/enzymejs/enzyme/issues/539
    const getMainMenuWrapper = (props: Props) => {
        return shallow(<MainMenu {...props}/>);

        // const wrapper = shallowWithIntl(<MainMenu {...props}/>);
        // return wrapper.find('MainMenu').shallow();
    };

    const defaultProps = {
        mobile: false,
        teamId: 'team-id',
        teamType: Constants.OPEN_TEAM,
        teamName: 'team_name',
        currentUser: TestHelper.getUserMock(),

        // appDownloadLink: undefined,
        enableCommands: false,
        enableCustomEmoji: false,
        enableIncomingWebhooks: false,
        enableOAuthServiceProvider: false,
        enableOutgoingWebhooks: false,
        canManageSystemBots: false,
        canCreateOrDeleteCustomEmoji: false,
        canManageIntegrations: true,

        // helpLink: undefined,
        // reportAProblemLink: undefined,
        pluginMenuItems: [],
        isMentionSearch: false,
        intl: createIntl({locale: 'en', defaultLocale: 'en', timeZone: 'Etc/UTC', textComponent: 'span'}),
        guestAccessEnabled: true,
        canInviteTeamMember: true,
        actions: {
            openModal: jest.fn(),
            showMentions: jest.fn(),
            showFlaggedPosts: jest.fn(),
            closeRightHandSide: jest.fn(),
            closeRhsMenu: jest.fn(),
            getCloudLimits: jest.fn(),
            showSettings: jest.fn(),
        },
        teamIsGroupConstrained: false,
        isCloud: false,
        isStarterFree: false,
        subscription: {},
        userIsAdmin: true,
        isFreeTrial: false,
        usageDeltaTeams: 1,
        ikGroupId: 1,
    };

    const defaultState = {
        entities: {
            channels: {
                myMembers: {},
            },
            general: {
                config: {},
                license: {
                    Cloud: 'false',
                },
            },
            teams: {
                currentTeamId: 'team-id',
                myMembers: {
                    'team-id': {
                        team_id: 'team-id',
                        user_id: 'test-user-id',
                        roles: 'team_user',
                        scheme_user: true,
                    },
                },
            },
            users: {
                currentUserId: 'test-user-id',
                profiles: {
                    'test-user-id': {
                        id: 'test-user-id',
                        roles: 'system_user system_manager',
                    },
                },
            },
            roles: {
                roles: {
                    system_manager: {
                        permissions: [
                            Permissions.SYSCONSOLE_WRITE_PLUGINS,
                        ],
                    },
                },
            },
        },
    };

    test('should match snapshot with id', () => {
        const props = {...defaultProps, id: 'test-id'};
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with most of the thing disabled', () => {
        const wrapper = getMainMenuWrapper(defaultProps);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with most of the thing disabled in mobile', () => {
        const props = {...defaultProps, mobile: true};
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with most of the thing enabled', () => {
        const props = {
            ...defaultProps,

            // appDownloadLink: 'test',
            enableCommands: true,
            enableCustomEmoji: true,
            canCreateOrDeleteCustomEmoji: true,
            enableIncomingWebhooks: true,
            enableOAuthServiceProvider: true,
            enableOutgoingWebhooks: true,

            // helpLink: 'test-link-help',
            // reportAProblemLink: 'test-report-link',
        };
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with most of the thing enabled in mobile', () => {
        const props = {
            ...defaultProps,
            mobile: true,

            // appDownloadLink: 'test',
            enableCommands: true,
            enableCustomEmoji: true,
            canCreateOrDeleteCustomEmoji: true,
            enableIncomingWebhooks: true,
            enableOAuthServiceProvider: true,
            enableOutgoingWebhooks: true,

            // helpLink: 'test-link-help',
            // reportAProblemLink: 'test-report-link',
        };
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with plugins', () => {
        const props = {
            ...defaultProps,
            pluginMenuItems: [{
                id: 'plugin-id-1',
                pluginId: 'plugin-1',
                mobileIcon: <i className='fa fa-anchor'/>,
                action: jest.fn,
                dropdownText: 'some dropdown text',
                tooltipText: 'some tooltip text',
            },
            {
                id: 'plugind-id-2',
                pluginId: 'plugin-2',
                mobileIcon: <i className='fa fa-anchor'/>,
                action: jest.fn,
                dropdownText: 'some dropdown text',
                tooltipText: 'some tooltip text',
            },
            ],
        };
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with plugins in mobile', () => {
        const props = {
            ...defaultProps,
            mobile: true,
            pluginMenuItems: [{
                id: 'plugin-id-1',
                pluginId: 'plugin-1',
                icon: <i className='fa fa-anchor'/>,
                action: jest.fn,
                dropdownText: 'some dropdown text',
                tooltipText: 'some tooltip text',
            },
            {
                id: 'plugind-id-2',
                pluginId: 'plugin-2',
                icon: <i className='fa fa-anchor'/>,
                action: jest.fn,
                dropdownText: 'some dropdown text',
                tooltipText: 'some tooltip text',
            },
            ],
        };
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper).toMatchSnapshot();
    });

    test('mobile view should hide the subscribe now button when does not have permissions', () => {
        const noPermissionsState = {...defaultState};
        noPermissionsState.entities.roles.roles.system_manager.permissions = [];
        const store = mockStore(noPermissionsState);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <MainMenu {...defaultProps}/>
            </Provider>,
        );

        expect(wrapper.find('UpgradeLink')).toHaveLength(0);
    });

    test('mobile view should hide start trial menu item because user state does not have permission to write license', () => {
        const store = mockStore(defaultState);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <MainMenu {...defaultProps}/>
            </Provider>,
        );

        expect(wrapper.find('#startTrial')).toHaveLength(0);
    });

    test('should match snapshot with guest access disabled and no team invite permission', () => {
        const props = {
            ...defaultProps,
            guestAccessEnabled: false,
            canInviteTeamMember: false,
        };
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with cloud free trial', () => {
        const props = {
            ...defaultProps,
            isCloud: true,
            isStarterFree: false,
            isFreeTrial: true,
            usageDeltaTeams: -1,
        };
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper.find('#createTeam')).toMatchSnapshot();
    });

    test('should match snapshot with cloud free and team limit reached', () => {
        const props = {
            ...defaultProps,
            isCloud: true,
            isStarterFree: true,
            isFreeTrial: false,
            usageDeltaTeams: 0,
        };
        const wrapper = getMainMenuWrapper(props);
        expect(wrapper.find('#createTeam')).toMatchSnapshot();
    });
});
