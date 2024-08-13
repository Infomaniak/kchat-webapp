// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import IconButton from '@infomaniak/compass-components/components/icon-button';
import type {TIconGlyph} from '@infomaniak/compass-components/foundations/icon';
import React, {useEffect} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import type {Team} from '@mattermost/types/teams';

import {closeRightHandSide, showSettings} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants, {RHSStates} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';

import type {GlobalState} from 'types/store';

type Props = {
    tab?: string;
    className?: string;
    icon?: TIconGlyph;
    tooltipPlacement?: string;
    tooltipContent?: string;
    currentTeam: Team;
}

const SettingsButton = ({tab = 'display', className, icon, tooltipPlacement, tooltipContent, currentTeam}: Props): JSX.Element | null => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));
    const history = useHistory();

    const settingButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!isDesktopApp()) {
            dispatch(showSettings(tab));

            //document.dispatchEvent(new CustomEvent('openSettings', {detail: ['ksuite-kchat', 'ksuite-kchat-personalization', {selectedId: currentTeam.product_id}]}));
        } else if (rhsState === RHSStates.SETTINGS) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showSettings(tab));
        }
    };

    const tooltip = (
        <Tooltip id='productSettings'>
            {tooltipContent || (
                <FormattedMessage
                    id='global_header.productSettings'
                    defaultMessage='Settings'
                />
            )}
        </Tooltip>
    );

    useEffect(() => {
        const handleWcNavigate = (e: any) => {
            if ('detail' in e) {
                history.push(e.detail);
            }
        };

        window.addEventListener('wcSettingsKChatNavigateTo', handleWcNavigate);
        return () => {
            window.removeEventListener('wcSettingsKChatNavigateTo', handleWcNavigate);
        };
    }, [history]);

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement={tooltipPlacement || 'bottom'}
            overlay={tooltip}
        >
            <IconButton
                id='right-controls-settings'
                className={`grey ${rhsState === RHSStates.SETTINGS ? 'active' : ''} ${className || ''}`}
                size={'sm'}
                icon={icon || 'cog'}
                toggled={rhsState === RHSStates.SETTINGS}
                onClick={settingButtonClick}
                inverted={true}
                compact={true}
                aria-haspopup='dialog'
                aria-label={formatMessage({id: 'global_header.productSettings', defaultMessage: 'Settings'})}
            />

        </OverlayTrigger>
    );
};

export default SettingsButton;
