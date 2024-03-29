// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import GuestTag from './guest_tag';

describe('components/widgets/tag/GuestTag', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(<GuestTag className={'test'}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
