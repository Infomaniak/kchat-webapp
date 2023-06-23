// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import ConfirmModalRedux from 'components/confirm_modal_redux';
import Markdown from 'components/markdown';

import './override_draft_modal.scss';

type Props = {
    message: string;
    onConfirm: () => void;
    onExited: () => void;
};

const OverrideDraftModal = ({message, onConfirm, onExited}: Props) => {
    const title = (
        <FormattedMessage
            id='drafts.override_draft.title'
            defaultMessage='Replace draft'
        />
    );

    const content = (
        <div className='alert alert-with-icon alert-danger'>
            <i className='icon-alert-outline'/>
            <FormattedMessage
                id='drafts.override_draft.message'
                defaultMessage='Unscheduling this draft will replace the following draft: {message}'
                values={{
                    message: (
                        <>
                            <br/>
                            <Markdown
                                options={{
                                    disableGroupHighlight: true,
                                    mentionHighlight: false,
                                }}
                                message={message}
                            />
                        </>
                    ),
                }}
            />
        </div>
    );

    const confirmButtonText = (
        <FormattedMessage
            id='generic_modal.confirm'
            defaultMessage='Confirm'
        />
    );

    return (
        <ConfirmModalRedux
            modalClass='override-draft-modal'
            title={title}
            message={content}
            confirmButtonText={confirmButtonText}
            confirmButtonClass='btn-danger'
            onConfirm={onConfirm}
            onExited={onExited}
        />
    );
};

export default OverrideDraftModal;
