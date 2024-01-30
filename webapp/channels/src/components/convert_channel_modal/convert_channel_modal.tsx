// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import type {ChannelType} from '@mattermost/types/channels';
import type {ServerError} from '@mattermost/types/errors';

import {General} from 'mattermost-redux/constants';
import type {ActionFunc} from 'mattermost-redux/types/actions';

import {openChannelLimitModalIfNeeded} from 'actions/cloud';
import {trackEvent} from 'actions/telemetry_actions.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import Constants from 'utils/constants';
import {localizeMessage} from 'utils/utils';

type Props = {
    channelDisplayName: string;
    channelId: string;
    channelType: ChannelType;

    /**
     * Function injected by ModalController to be called when the modal can be unmounted
     */
    onExited: () => void;

    actions: {
        updateChannelPrivacy: (channelId: string, privacy: string, openChannelLimitModalIfNeeded: (error: ServerError, type: ChannelType) => ActionFunc) => void;
    };
}

type State = {
    show: boolean;
    type: string;
}

export default class ConvertChannelModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
            type: localizeMessage(this.props.channelType === Constants.PRIVATE_CHANNEL ? 'admin.channel_list.public' : 'admin.channel_list.private')?.toLocaleLowerCase(),
        };
    }

    handleConvert = () => {
        const {actions, channelId} = this.props;
        if (channelId.length !== Constants.CHANNEL_ID_LENGTH) {
            return;
        }

        actions.updateChannelPrivacy(channelId, this.props.channelType === Constants.PRIVATE_CHANNEL ? General.OPEN_CHANNEL : General.PRIVATE_CHANNEL, openChannelLimitModalIfNeeded);
        trackEvent('actions', 'convert_to_private_channel', {channel_id: channelId});
        this.onHide();
    };

    onHide = () => {
        this.setState({show: false});
    };

    render() {
        const {
            channelDisplayName,
            onExited,
        } = this.props;

        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={onExited}
                role='dialog'
                aria-labelledby='convertChannelModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='convertChannelModalLabel'
                    >
                        <FormattedMessage
                            id='convert_channel.title'
                            defaultMessage='Convert {display_name} to a {type} Channel?'
                            values={{
                                display_name: channelDisplayName,
                                type: this.state.type,
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <FormattedMarkdownMessage
                            id={this.props.channelType === Constants.PRIVATE_CHANNEL ? 'convert_channel.question1.public' : 'convert_channel.question1'}
                            defaultMessage='When you convert **{display_name}** to a {type} channel, history and membership are preserved.'
                            values={{
                                display_name: channelDisplayName,
                                type: this.state.type,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMarkdownMessage
                            id='convert_channel.question3'
                            defaultMessage='Are you sure you want to convert **{display_name}** to a {type} channel?'
                            values={{
                                display_name: channelDisplayName,
                                type: this.state.type,
                            }}
                        />
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link secondary'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='convert_channel.cancel'
                            defaultMessage='No, cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        data-dismiss='modal'
                        onClick={this.handleConvert}
                        autoFocus={true}
                        data-testid='convertChannelConfirm'
                    >
                        <FormattedMessage
                            id='convert_channel.confirm'
                            defaultMessage='Yes, convert to {type} channel'
                            values={{
                                type: this.state.type,
                            }}
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
