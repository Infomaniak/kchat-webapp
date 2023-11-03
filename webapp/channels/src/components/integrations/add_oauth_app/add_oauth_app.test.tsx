// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import {TestHelper} from 'utils/test_helper';

import AddOAuthApp from 'components/integrations/add_oauth_app/add_oauth_app';

describe('components/integrations/AddOAuthApp', () => {
    const emptyFunction = jest.fn();
    const team = TestHelper.getTeamMock({
        id: 'dbcxd9wpzpbpfp8pad78xj12pr',
        name: 'test',
    });

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AddOAuthApp
                team={team}
                actions={{addOAuthApp: emptyFunction}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
