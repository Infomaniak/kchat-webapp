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

import WithTooltip from 'components/with_tooltip';

import {RHSStates} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';

import type {GlobalState} from 'types/store';

type Props = {
    tab?: string;
    className?: string;
    icon?: TIconGlyph;
    tooltipPlacement?: string;
    tooltipContent?: string;
    currentTeam?: Team;
}

const SettingsButton = ({tab = 'display', className, icon, currentTeam}: Props): JSX.Element | null => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));
    const history = useHistory();

    const settingButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!isDesktopApp()) {
            document.dispatchEvent(new CustomEvent('openSettings', {detail: ['ksuite-kchat', 'ksuite-kchat-personalization', {selectedId: currentTeam?.product_id}]}));
        } else if (rhsState === RHSStates.SETTINGS) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showSettings(tab));
        }
    };

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
        <WithTooltip
            title={
                <FormattedMessage
                    id='global_header.productSettings'
                    defaultMessage='Settings'
                />
            }
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
        </WithTooltip>
    );
};

export default SettingsButton;
