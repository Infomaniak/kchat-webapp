// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MicrophoneOutlineIcon} from '@infomaniak/compass-icons/components';
import React, {memo} from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {Post, PostType} from '@mattermost/types/posts';

import {isVoiceMessagesEnabled} from 'selectors/views/textbox';

import {IconContainer} from 'components/advanced_text_editor/formatting_bar/formatting_icon';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants, {Locations} from 'utils/constants';

import type {PostDraft} from 'types/store/draft';

interface Props {
    channelId: Channel['id'];
    rootId: Post['id'];
    location: string;
    draft: PostDraft;
    disabled: boolean;
    onClick: (channelOrRootId: Channel['id'] | Post['id'], draft: PostDraft, postType?: PostDraft['postType']) => void;
}

const VoiceButton = (props: Props) => {
    const {formatMessage} = useIntl();

    const isVoiceMessagesFeatureEnabled = useSelector(isVoiceMessagesEnabled);

    const isVoiceRecordingBrowserSupported = navigator && navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined;

    if (!isVoiceMessagesFeatureEnabled || !isVoiceRecordingBrowserSupported) {
        return null;
    }

    function handleOnClick() {
        if (!props.disabled) {
            if (props.location === Locations.CENTER) {
                props.onClick(props.channelId, props.draft, Constants.PostTypes.VOICE as PostType);
            }
            if (props.location === Locations.RHS_COMMENT) {
                props.onClick(props.rootId, props.draft, Constants.PostTypes.VOICE as PostType);
            }
        }
    }

    return (
        <OverlayTrigger
            placement='left'
            delayShow={Constants.OVERLAY_TIME_DELAY}
            trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
            rootClose={true}
            disabled={props.disabled}
            overlay={
                <Tooltip id='voiceMessageButtonTooltip'>
                    <FormattedMessage
                        id={'advanceTextEditor.voiceMessageButton.tooltip'}
                        defaultMessage='Voice message'
                    />
                </Tooltip>}
        >
            <IconContainer
                id='voiceMessageButton'
                type='button'
                onClick={handleOnClick}
                disabled={props.disabled}
                aria-label={formatMessage({id: 'advanceTextEditor.voiceMessageButton.tooltip', defaultMessage: 'Voice message'})}
            >
                <MicrophoneOutlineIcon
                    size={18}
                    color={'currentColor'}
                />
            </IconContainer>
        </OverlayTrigger>
    );
};

export default memo(VoiceButton);
