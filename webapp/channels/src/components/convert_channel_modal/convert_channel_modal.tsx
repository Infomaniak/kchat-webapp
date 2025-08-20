// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import type {ChannelType} from '@mattermost/types/channels';

import {General} from 'mattermost-redux/constants';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import Constants from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import type {ActionFunc} from 'types/store';

type Props = {
    channelDisplayName: string;
    channelId: string;
    channelType: ChannelType;

    /**
     * Function injected by ModalController to be called when the modal can be unmounted
     */
    onExited: () => void;

    actions: {
        updateChannelPrivacy: (channelId: string, privacy: string) => void;
    };
}

type State = {
    show: boolean;
    type: string;
}

export default class ConvertChannelModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const publicChannel = localizeMessage({id: 'admin.channel_list.public', defaultMessage: 'Public'});
        const privateChannel = localizeMessage({id: 'admin.channel_list.private', defaultMessage: 'Private'});

        this.state = {
            show: true,
            type: (this.props.channelType === Constants.PRIVATE_CHANNEL ? publicChannel : privateChannel).toLocaleLowerCase(),
        };
    }

    handleConvert = () => {
        const {actions, channelId} = this.props;
        if (channelId.length !== Constants.CHANNEL_ID_LENGTH) {
            return;
        }

        actions.updateChannelPrivacy(channelId, this.props.channelType === Constants.PRIVATE_CHANNEL ? General.OPEN_CHANNEL : General.PRIVATE_CHANNEL);
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
                role='none'
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
                        <FormattedMessage
                            id={this.props.channelType === Constants.PRIVATE_CHANNEL ? 'convert_channel.question1.public' : 'convert_channel.question1'}
                            defaultMessage='When you convert <b>{display_name}</b> to a {type} channel, history and membership are preserved.'
                            values={{
                                display_name: channelDisplayName,
                                type: this.state.type,
                                b: (chunks: string) => <b>{chunks}</b>,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='convert_channel.question3'
                            defaultMessage='Are you sure you want to convert <b>{display_name}</b> to a {type} channel?'
                            values={{
                                display_name: channelDisplayName,
                                type: this.state.type,
                                b: (chunks: string) => <b>{chunks}</b>,
                            }}
                        />
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link secondary'
                        onClick={this.onHide}
                        data-testid='convertChannelCancel'
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
