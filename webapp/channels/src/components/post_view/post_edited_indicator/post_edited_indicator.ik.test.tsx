import {mount} from 'enzyme';
import React from 'react';

import PostEditedIndicator from './post_edited_indicator';

describe('components/post_edited_indicator with Ik changes', () => {
    const baseProps = {
        postId: 'postId',
        editedAt: 15000000,
        isMilitaryTime: false,
        canEdit: false,
        actions: {
            openShowEditHistory: jest.fn(),
        },
    };
    test('should not show "show history" button', () => {
        const wrapper = mount(<PostEditedIndicator {...baseProps}/>);
        const tooltip = wrapper.find('WithTooltip');

        const titleProp = tooltip.prop('title');
        const titleWrapper = mount(<>{titleProp}</>);

        expect(titleWrapper.find('.view-history__text').exists()).toBe(false);
    });
});
