// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import {openModal} from 'actions/views/modals';

import {ModalIdentifiers} from 'utils/constants';

import Action from './action';
import DeleteDraftModal from './delete_draft_modal';
import SendDraftModal from './send_draft_modal';

type Props = {
    displayName: string;
    itemId: string;
    onDelete: (itemId: string) => void;
    onEdit: () => void;
    onSend: (itemId: string) => void;
}

function DraftActions({
    displayName,
    itemId,
    onDelete,
    onEdit,
    onSend,
}: Props) {
    const dispatch = useDispatch();

    const handleDelete = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.DELETE_DRAFT,
            dialogType: DeleteDraftModal,
            dialogProps: {
                displayName,
                onConfirm: () => onDelete(itemId),
            },
        }));
    }, [displayName]);

    const handleSend = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.SEND_DRAFT,
            dialogType: SendDraftModal,
            dialogProps: {
                displayName,
                onConfirm: () => onSend(itemId),
            },
        }));
    }, [dispatch, displayName, itemId, onSend]);

    return (
        <>
            <Action
                icon='icon-trash-can-outline'
                id='delete'
                name='delete'
                tooltipText={(
                    <FormattedMessage
                        id='drafts.actions.delete'
                        defaultMessage='Delete draft'
                    />
                )}
                onClick={handleDelete}
            />
            <Action
                icon='icon-pencil-outline'
                id='edit'
                name='edit'
                tooltipText={(
                    <FormattedMessage
                        id='drafts.actions.edit'
                        defaultMessage='Edit draft'
                    />
                )}
                onClick={onEdit}
            />
            <Action
                icon='icon-send-outline'
                id='send'
                name='send'
                tooltipText={(
                    <FormattedMessage
                        id='drafts.actions.send'
                        defaultMessage='Send draft'
                    />
                )}
                onClick={handleSend}
            />
        </>
    );
}

export default memo(DraftActions);
