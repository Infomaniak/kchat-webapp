// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {GenericModal} from '@mattermost/components';
import type {Limits} from '@mattermost/types/cloud';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';

import type {Message} from 'utils/i18n';

import WorkspaceLimitsPanel, {messageToElement} from './workspace_limits_panel';

import './index.scss';

interface ModalAction {
    message: Message | React.ReactNode;
    onClick?: () => void;
}
export interface Props {
    title: Message | React.ReactNode;
    description?: Message | React.ReactNode;
    primaryAction?: ModalAction;
    secondaryAction?: ModalAction;
    onClose: () => void;
    ownLimits?: Limits;
    backdrop?: boolean;
    backdropClassName?: string;
    className?: string;

    // e.g. in contexts where the CompassThemeProvider isn't already applied, like the system console
    needsTheme?: boolean;
}

export default function CloudUsageModal(props: Props) {
    const [limits] = useGetLimits();
    const usage = useGetUsage();
    const theme = useSelector(getTheme);

    const modal = (
        <GenericModal
            handleCancel={props.onClose}
            compassDesign={true}
            onExited={props.onClose}
            modalHeaderText={messageToElement(props.title)}
            cancelButtonText={props.secondaryAction && messageToElement(props.secondaryAction.message)}
            handleConfirm={props.primaryAction?.onClick}
            confirmButtonText={props.primaryAction && messageToElement(props.primaryAction.message)}
            className='CloudUsageModal'
            backdrop={props.backdrop}
            backdropClassName={props.backdropClassName}
        >
            <>
                {React.isValidElement(props.description) ? props.description : <p className='CloudUsageModal__description'>
                    {props.description && messageToElement(props.description)}
                </p>}
                <WorkspaceLimitsPanel
                    showIcons={true}
                    limits={props.ownLimits || limits}
                    usage={usage}
                />
            </>
        </GenericModal>
    );

    if (!props.needsTheme) {
        return modal;
    }

    return (
        <CompassThemeProvider theme={theme}>
            {modal}
        </CompassThemeProvider>
    );
}
