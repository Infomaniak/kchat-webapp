
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {
    Post,
    PostMetadata,
} from '@mattermost/types/posts';

import {PostTypes} from 'mattermost-redux/constants/posts';

import MessageAttachmentList from 'components/post_view/message_attachments/message_attachment_list';

import type {Props} from './post_body_additional_content';
import PostBodyAdditionalContent from './post_body_additional_content';

jest.mock('mattermost-redux/utils/post_utils', () => {
    const actual = jest.requireActual('mattermost-redux/utils/post_utils');
    return {
        ...actual,
        getEmbedFromMetadata: jest.fn(actual.getEmbedFromMetadata),
    };
});

describe('PostBodyAdditionalContent', () => {
    const baseProps: Props = {
        children: <span>{'some children'}</span>,
        post: {
            id: 'post_id_1',
            root_id: 'root_id',
            channel_id: 'channel_id',
            create_at: 1,
            message: '',
            metadata: {} as PostMetadata,
        } as Post,
        isEmbedVisible: true,
        handleFileDropdownOpened: jest.fn(),
        actions: {
            toggleEmbedVisibility: jest.fn(),
        },
        appsEnabled: false,
    };

    describe('with a permalinklink', () => {
        const permalinkUrl = 'https://community.mattermost.com/core/pl/123456789';

        const permalinkBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                message: permalinkUrl,
                metadata: {
                    embeds: [{
                        type: 'permalink',
                        url: '',
                        data: {
                            post_id: 'post_id123',
                            channel_display_name: 'channel1',
                            team_name: 'core',
                            channel_type: 'O',
                            channel_id: 'channel_id',
                        },
                    }],
                    images: {},
                    emojis: [],
                    files: [],
                    reactions: [],
                } as PostMetadata,
            },
        };

        test('Render permalink preview', () => {
            const wrapper = shallow(<PostBodyAdditionalContent {...permalinkBaseProps}/>);
            expect(wrapper).toMatchSnapshot();
        });

        test('Render permalink preview with no data', () => {
            const metadata = {
                embeds: [{
                    type: 'permalink',
                    url: '',
                }],
            } as PostMetadata;
            const props = {
                ...permalinkBaseProps,
                post: {
                    ...permalinkBaseProps.post,
                    metadata,
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);
            expect(wrapper).toMatchSnapshot();
        });

        test('should render MessageAttachmentList for ephemeral system post with permalink embed', () => {
            const attachments = [{id: 'att1', text: 'Vous recevrez un rappel de ce message'}];
            const ephemeralSystemPermalinkProps = {
                ...baseProps,
                post: {
                    ...baseProps.post,
                    type: PostTypes.EPHEMERAL,
                    props: {
                        attachments,
                    },
                    metadata: {
                        embeds: [{
                            type: 'permalink',
                            url: '',
                            data: {
                                post_id: 'post_id123',
                                channel_display_name: 'channel1',
                                team_name: 'core',
                                channel_type: 'O',
                                channel_id: 'channel_id',
                            },
                        }],
                        images: {},
                        emojis: [],
                        files: [],
                        reactions: [],
                    } as PostMetadata,
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...ephemeralSystemPermalinkProps}/>);
            expect(wrapper.find(MessageAttachmentList).exists()).toBe(true);
            expect(wrapper.find('PostMessagePreview').exists()).toBe(false);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
