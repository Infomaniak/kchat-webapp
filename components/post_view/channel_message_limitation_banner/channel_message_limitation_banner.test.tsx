// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Provider} from 'react-redux';

import mockStore from 'tests/test_store';

import ChannelMessageLimitationBanner from './channel_message_limitation_banner';

describe('components/post_view/ChannelMessageLimitationBanner', () => {
    const baseProps = {
        olderMessagesDate: '2022-07-28 00:02:15.741000',
    };

    const store = mockStore({});

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <ChannelMessageLimitationBanner{...baseProps}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
