// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';

import {GlobalState} from 'types/store';

import {ModalIdentifiers} from 'utils/constants';

import ConfirmModal from 'components/confirm_modal';

const ToggleNextModal = () => {
    const dispatch = useDispatch();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.TOGGLE_NEXT));
    const {formatMessage} = useIntl();
    const isNext = document.cookie.indexOf('KCHAT_NEXT=always') !== -1;

    const handleClose = () => {
        dispatch(closeModal(ModalIdentifiers.TOGGLE_NEXT));
    };

    const handleConfirm = () => {
        const value = isNext ? 'never' : 'always';
        let domain = '.infomaniak.com';
        if (window.location.hostname.indexOf('.preprod.dev.infomaniak.ch') !== -1) {
            domain = '.preprod.dev.infomaniak.ch';
        }

        // 1 year life time cookie
        document.cookie = `KCHAT_NEXT=${value}; path=/; domain=${domain}; secure; samesite=lax; max-age=31536000`;

        window.location.reload();
    };

    const title = formatMessage({
        id: 'toggle_next_modal.title',
        defaultMessage: 'Switch to {version} version',
    }, {
        version: isNext ? 'STABLE' : 'NEXT',
    });

    const message = isNext ? (
        <div>
            {formatMessage({
                id: 'toggle_next_modal.message_stable',
                defaultMessage: 'STABLE is our default environment. If you are not interested by testing new features, we recommend going back to the STABLE version.',
            })}
        </div>
    ) : (
        <div className='alert alert-with-icon alert-danger'>
            <i className='icon-alert-outline'/>
            {formatMessage({
                id: 'toggle_next_modal.message_next',
                defaultMessage: 'NEXT is our test environment. You might encounter some bugs, but will also access the latest content and updates. If you are not interested by testing new features, we recommend staying on the STABLE version.',
            })}
        </div>
    );

    const confirmButtonText = formatMessage({
        id: 'generic_modal.confirm',
        defaultMessage: 'Confirm',
    });

    let confirmButtonClass;
    if (!isNext) {
        confirmButtonClass = 'btn-danger';
    }

    return (
        <ConfirmModal
            show={show}
            onExited={handleClose}
            onCancel={handleClose}
            onConfirm={handleConfirm}
            title={title}
            message={message}
            confirmButtonText={confirmButtonText}
            confirmButtonClass={confirmButtonClass}
        />
    );
};

export default ToggleNextModal;
