// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, mount} from 'enzyme';
import {FormattedMessage, IntlProvider} from 'react-intl';

import AlertBanner from 'components/alert_banner';
import ExternalLoginButton from 'components/external_login_button/external_login_button';
import LoadingScreen from 'components/loading_screen';
import Login from 'components/login/login';
import Input from 'components/widgets/inputs/input/input';
import PasswordInput from 'components/widgets/inputs/password_input/password_input';
import SaveButton from 'components/save_button';

import users from 'mattermost-redux/actions/users';
import {RequestStatus} from 'mattermost-redux/constants';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {ClientConfig} from '@mattermost/types/config';
import LocalStorageStore from 'stores/local_storage_store';
import {GlobalState} from 'types/store';
import Constants, {WindowSizes} from 'utils/constants';

let mockState: GlobalState;
let mockLocation = {pathname: '', search: '', hash: ''};
const mockHistoryReplace = jest.fn();
const mockHistoryPush = jest.fn();
const mockLicense = {IsLicensed: 'false'};
let mockConfig: Partial<ClientConfig>;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: jest.fn(() => (action: ActionFunc) => action),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom') as typeof import('react-router-dom'),
    useLocation: () => mockLocation,
    useHistory: () => ({
        replace: mockHistoryReplace,
        push: mockHistoryPush,
    }),
}));

jest.mock('mattermost-redux/selectors/entities/general', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/general') as typeof import('mattermost-redux/selectors/entities/general'),
    getLicense: () => mockLicense,
    getConfig: () => mockConfig,
}));

describe('components/login/Login', () => {
    beforeEach(() => {
        mockLocation = {pathname: '', search: '', hash: ''};

        LocalStorageStore.setWasLoggedIn(false);

        mockState = {
            entities: {
                general: {
                    config: {},
                    license: {},
                },
                users: {
                    currentUserId: '',
                    profiles: {
                        user1: {
                            id: 'user1',
                            roles: '',
                        },
                    },
                },
                teams: {
                    currentTeamId: 'team1',
                    teams: {
                        team1: {
                            id: 'team1',
                            name: 'team-1',
                            displayName: 'Team 1',
                        },
                    },
                    myMembers: {
                        team1: {roles: 'team_role'},
                    },
                },
            },
            requests: {
                users: {
                    logout: {
                        status: RequestStatus.NOT_STARTED,
                    },
                },
            },
            storage: {
                initialized: true,
            },
            views: {
                browser: {
                    windowSize: WindowSizes.DESKTOP_VIEW,
                },
            },
        } as unknown as GlobalState;

        mockConfig = {
            EnableLdap: 'false',
            EnableSaml: 'false',
            EnableSignInWithEmail: 'false',
            EnableSignInWithUsername: 'false',
            EnableSignUpWithEmail: 'false',
            EnableSignUpWithGitLab: 'false',
            EnableSignUpWithOffice365: 'false',
            EnableSignUpWithGoogle: 'false',
            EnableSignUpWithOpenId: 'false',
            EnableOpenServer: 'false',
            LdapLoginFieldName: '',
            GitLabButtonText: '',
            GitLabButtonColor: '',
            OpenIdButtonText: '',
            OpenIdButtonColor: '',
            SamlLoginButtonText: '',
            EnableCustomBrand: 'false',
            CustomBrandText: '',
            CustomDescriptionText: '',
            SiteName: 'Mattermost',
            ExperimentalPrimaryTeam: '',
        };
    });

    it('should match snapshot', () => {
        const wrapper = shallow(
            <Login/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with base login', () => {
        mockConfig.EnableSignInWithEmail = 'true';

        const wrapper = shallow(
            <Login/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should handle initializing when logout status success', () => {
        mockState.requests.users.logout.status = RequestStatus.SUCCESS;

        const intlProviderProps = {
            defaultLocale: 'en',
            locale: 'en',
            messages: {},
        };

        const wrapper = mount(
            <IntlProvider {...intlProviderProps}>
                <Login/>
            </IntlProvider>,
        );

        const loadingScreen = wrapper.find(LoadingScreen).first();
        expect(loadingScreen.find(FormattedMessage).first().props().defaultMessage).toEqual('Loading');
    });

    it('should handle initializing when storage not initalized', () => {
        mockState.storage.initialized = false;

        const intlProviderProps = {
            defaultLocale: 'en',
            locale: 'en',
            messages: {},
        };

        const wrapper = mount(
            <IntlProvider {...intlProviderProps}>
                <Login/>
            </IntlProvider>,
        );

        const loadingScreen = wrapper.find(LoadingScreen).first();
        expect(loadingScreen.find(FormattedMessage).first().props().defaultMessage).toEqual('Loading');
    });
});
