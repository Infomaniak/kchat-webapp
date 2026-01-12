// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {MouseEventHandler, ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import type {ServerError} from '@mattermost/types/errors';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import {getNextWcPack, openUpgradeDialog} from 'mattermost-redux/utils/plans_util';

import {isErrorInvalidSlashCommand} from 'utils/post_utils';
import {getShopUrl} from 'utils/utils';

interface Props {
    error: ServerError;
    handleSubmit: MouseEventHandler<HTMLAnchorElement>;
    submittedMessage?: string;
}

function MessageSubmitError(props: Props) {
    const currentPlan = useSelector(getCurrentPackName);
    const nextPlan = getNextWcPack(currentPlan);

    if (isErrorInvalidSlashCommand(props.error)) {
        const slashCommand = props.submittedMessage?.split(' ')[0];

        return (
            <div className='has-error'>
                <div className='control-label'>
                    <FormattedMessage
                        id='message_submit_error.invalidCommand'
                        defaultMessage="Command with a trigger of ''{command}'' not found. "
                        values={{
                            command: slashCommand,
                        }}
                    />
                    <a
                        href='#'
                        role='button'
                        onClick={props.handleSubmit}
                    >
                        <FormattedMessage
                            id='message_submit_error.sendAsMessageLink'
                            defaultMessage='Click here to send as a message.'
                        />
                    </a>
                </div>
            </div>
        );
    }

    if (props.error?.message?.trim()?.length === 0) {
        return null;
    }

    let message: string | ReactNode = props.error.message.trim();

    const messageToFormat = ['file_upload.quota.exceeded', 'file_upload.quota.exceeded.admin', 'file_upload.quota.exceeded.paidPlan.admin'];

    // IK: this is a special case, we do the translation here as we need to inject a translated component aswell (which is complicated from redux action)
    if (messageToFormat.includes(props.error?.message)) {
        message = (
            <FormattedMessage
                id={props.error?.message}
                values={{
                    upsell: (chunks) => (
                        <a
                            onClick={() => {
                                if (props.error.message === 'file_upload.quota.exceeded.paidPlan.admin') {
                                    window.open(getShopUrl(), '_blank');
                                } else {
                                    openUpgradeDialog(nextPlan);
                                }
                            }
                            }
                            href='#'
                        >{chunks}</a>
                    ),
                }}
            />
        );
    }

    return (
        <div className='has-error'>
            <label className='control-label'>{message}</label>
        </div>
    );
}

export default MessageSubmitError;
