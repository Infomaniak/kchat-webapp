// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import {Provider} from 'react-redux';

import RadioGroup from 'components/common/radio_group';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import mockStore from 'tests/test_store';

import InviteAs, {InviteType} from './invite_as';

jest.mock('mattermost-redux/selectors/entities/users', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/users') as typeof import('mattermost-redux/selectors/entities/users'),
    isCurrentUserSystemAdmin: () => true,
}));

describe('components/cloud_start_trial_btn/cloud_start_trial_btn', () => {
    const props = {
        setInviteAs: jest.fn(),
        inviteType: InviteType.MEMBER,
        titleClass: 'title',
    };

    const state = {
        entities: {
            admin: {
                prevTrialLicense: {
                    IsLicensed: 'true',
                },
            },
            general: {
                config: {
                    BuildEnterpriseReady: 'true',
                },
                license: {
                    IsLicensed: 'true',
                    Cloud: 'true',
                },
            },
            cloud: {
                subscription: {
                    is_free_trial: 'false',
                    trial_end_at: 0,
                },
            },
            users: {
                currentUserId: 'uid',
                profiles: {
                    uid: {},
                },
            },
        },
    };

    const store = mockStore(state);

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <InviteAs {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('shows the radio buttons', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteAs {...props}/>
            </Provider>,
        );
        expect(wrapper.find(RadioGroup).length).toBe(1);
    });
});
