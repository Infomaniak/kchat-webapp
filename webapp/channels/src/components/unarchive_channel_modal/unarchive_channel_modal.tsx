// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import Constants from 'utils/constants';

import type {Channel, ChannelType} from '@mattermost/types/channels';
import type {ServerError} from '@mattermost/types/errors';

import type {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';

import {openChannelLimitModalIfNeeded} from 'actions/cloud';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

type Props = {
    onExited: () => void;
    channel: Channel;
    actions: ChannelDetailsActions;
}

type State = {
    show: boolean;
}

export type ChannelDetailsActions = {
    unarchiveChannel: (channelId: string, openLimitModalIfNeeded: (error: ServerError, type: ChannelType) => ActionFunc) => Promise<ActionResult>;
};

export default class UnarchiveChannelModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {show: true};
    }

    handleUnarchive = (): void => {
        if (this.props.channel.id.length !== Constants.CHANNEL_ID_LENGTH) {
            return;
        }
        this.props.actions.unarchiveChannel(this.props.channel.id, openChannelLimitModalIfNeeded);
        this.onHide();
    };

    onHide = (): void => {
        this.setState({show: false});
    };

    render(): JSX.Element {
        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='unarchiveChannelModalLabel'
                id='unarchiveChannelModal'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='unarchiveChannelModalLabel'
                    >
                        <FormattedMessage
                            id='unarchive_channel.confirm'
                            defaultMessage='Confirm UNARCHIVE Channel'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='alert alert-danger'>
                        <FormattedMarkdownMessage
                            id='unarchive_channel.viewArchived.question'
                            defaultMessage={'Are you sure you wish to unarchive the **{display_name}** channel?'}
                            values={{
                                display_name: this.props.channel.display_name,
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='unarchive_channel.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-danger'
                        data-dismiss='modal'
                        onClick={this.handleUnarchive}
                        autoFocus={true}
                        id='unarchiveChannelModalDeleteButton'
                    >
                        <FormattedMessage
                            id='unarchive_channel.del'
                            defaultMessage='Unarchive'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
