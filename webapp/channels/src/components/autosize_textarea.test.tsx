// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {AutosizeTextarea} from 'components/autosize_textarea';

global.ResizeObserver = require('resize-observer-polyfill');

describe('components/AutosizeTextarea', () => {
    test('should match snapshot, init', () => {
        const wrapper = shallow(
            <AutosizeTextarea/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
