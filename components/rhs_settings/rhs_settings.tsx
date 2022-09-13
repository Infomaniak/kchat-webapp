// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
/* eslint-disable react/no-string-refs */

import {FormattedMessage} from 'react-intl';

import styled from 'styled-components';

import {useDispatch, useSelector} from 'react-redux';

import {Channel} from '@mattermost/types/channels';
import {Post} from '@mattermost/types/posts';

import {FakePost, RhsState} from 'types/store/rhs';

import RhsHeaderPost from 'components/rhs_header_post';
import ThreadViewer from 'components/threading/thread_viewer';
import OverlayTrigger from '../overlay_trigger';
import Constants, {RHSStates} from '../../utils/constants';
import LocalizedIcon from '../localized_icon';
import {t} from '../../utils/i18n';

import Tooltip from '../tooltip';

import {GlobalState} from '../../types/store';
import {getRhsState} from '../../selectors/rhs';
import {closeRightHandSide, showSettingss} from '../../actions/views/rhs';

export interface Props {
    isMobile?: boolean;
}
const Icon = styled.i`
    font-size:12px;
`;

const BackButton = styled.button`
    border: 0px;
    background: transparent;
`;

const HeaderTitle = styled.span`
    line-height: 2.4rem;
`;
const RhsSettings = ({
    isMobile,
}: Props) => {
    const dispatch = useDispatch();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));
    console.log(isMobile);
    const onClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.SETTINGS) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showSettingss());
        }
    };

    const closeSidebarTooltip = (
        <Tooltip id='closeSidebarTooltip'>
            <FormattedMessage
                id='rhs_header.closeSidebarTooltip'
                defaultMessage='Close'
            />
        </Tooltip>
    );

    return (
        <div className='sidebar--right__content'>
            <div
                id='rhsContainer'
                className='sidebar-right__body'
            >
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

                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={closeSidebarTooltip}
                    >
                        <button
                            id='rhsCloseButton'
                            type='button'
                            className='sidebar--right__close btn-icon'
                            aria-label='Close'
                            onClick={onClose}
                        >
                            <LocalizedIcon
                                className='icon icon-close'
                                ariaLabel={{id: t('rhs_header.closeTooltip.icon'), defaultMessage: 'Close Sidebar Icon'}}
                            />
                        </button>
                    </OverlayTrigger>
                </div>
            {/*    end of header  */}
                
            </div>
        </div>
    );
};

export default RhsSettings;

