// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
/* eslint-disable react/no-string-refs */
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {closeRightHandSide, showSettings} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';

import WithTooltip from 'components/with_tooltip';

import {RHSStates} from 'utils/constants';
import {t} from 'utils/i18n';

import type {GlobalState} from 'types/store';

export interface Props {
    isMobile?: boolean;
}

const BackButton = styled.button`
    border: 0;
    background: transparent;
`;

const HeaderTitle = styled.span`
    line-height: 2.4rem;
`;

export default function RhsSettingsHeader({
    isMobile,
}: Props) {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));

    const onClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.SETTINGS) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showSettings());
        }
    };

    const closeSidebarTooltip = (
        <FormattedMessage
            id='rhs_header.closeSidebarTooltip'
            defaultMessage='Close'
        />
    );

    return (
        <div className='sidebar--right__header'>
            <span className='sidebar--right__title'>

                {isMobile && (
                    <BackButton
                        className='sidebar--right__back'
                        onClick={onClose}
                    >
                        <i
                            className='icon icon-arrow-back-ios'
                            aria-label='Back Icon'
                        />
                    </BackButton>
                )}

                <HeaderTitle>
                    <FormattedMessage
                        id='global_header.productSettings'
                        defaultMessage='Settings'
                    />
                </HeaderTitle>

            </span>

            <WithTooltip
                title={closeSidebarTooltip}
            >
                <button
                    id='rhsCloseButton'
                    type='button'
                    className='sidebar--right__close btn btn-icon'
                    aria-label='Close'
                    onClick={onClose}
                >
                    <i
                        className='icon icon-close'
                        aria-label={formatMessage({id: t('rhs_header.closeTooltip.icon'), defaultMessage: 'Close Sidebar Icon'})}
                    />
                </button>
            </WithTooltip>
        </div>
    );
}

