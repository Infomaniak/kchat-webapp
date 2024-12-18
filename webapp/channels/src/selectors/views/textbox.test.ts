// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {isVoiceMessagesEnabled} from 'selectors/views/textbox';

import type {GlobalState} from 'types/store';

describe('selectors/views/textbox', () => {
    it('isVoiceMessagesEnabled', () => {
        expect(isVoiceMessagesEnabled({
            entities: {
                general: {
                    config: {
                        EnableFileAttachments: 'true',
                        FeatureFlagEnableVoiceMessages: 'true',
                        ExperimentalEnableVoiceMessage: 'true',
                    },
                },
            },
        } as GlobalState)).toEqual(true);

        [
            ['false', 'false', 'false'],
            ['false', 'false', 'true'],
            ['false', 'true', 'false'],
            ['false', 'true', 'true'],
            ['true', 'false', 'false'],
            ['true', 'false', 'true'],
            ['true', 'true', 'false'],
        ].forEach((config) => {
            expect(isVoiceMessagesEnabled({
                entities: {
                    general: {
                        config: {
                            EnableFileAttachments: config[0],
                            FeatureFlagEnableVoiceMessages: config[1],
                            ExperimentalEnableVoiceMessage: config[2],
                        },
                    },
                },
            } as GlobalState)).toEqual(false);
        });
    });
});
