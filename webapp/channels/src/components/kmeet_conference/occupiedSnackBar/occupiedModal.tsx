// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {InformationOutlineIcon} from '@infomaniak/compass-icons/components';
import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {GenericModal} from '@mattermost/components';

import './occupied_modal.scss';

import {closeModal} from 'actions/views/modals';

import {ModalIdentifiers} from 'utils/constants';

type PropsType = {
    name: string;
}
export const OccupiedModal = ({name}: PropsType) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const {formatMessage} = useIntl();
    const text = formatMessage({id: 'call_occupied_modal.info', defaultMessage: 'test'});
    const dispatch = useDispatch();

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            dispatch(closeModal(ModalIdentifiers.OCCUPIED_CALL));
        }, 5000);
        return () => {
            dispatch(closeModal(ModalIdentifiers.OCCUPIED_CALL));
            clearTimeout(timeout);
        };
    }, []);
    return (
        <>
            <GenericModal
                className='call_ringing_occupied_modal'
                backdrop={false}
            >
                <div ref={modalRef}>
                    <div className='content-body'>
                        <div className='icon'>
                            <InformationOutlineIcon/>
                        </div>
                        <div className='text'>
                            {name + text}
                        </div>
                    </div>
                </div>
            </GenericModal>
        </>
    );
};
export default OccupiedModal;
