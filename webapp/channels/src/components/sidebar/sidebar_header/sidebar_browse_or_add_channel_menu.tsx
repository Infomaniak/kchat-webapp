// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {
    PlusIcon,
    FolderPlusOutlineIcon,
    AccountMultiplePlusOutlineIcon,
    GlobeIcon,
    AccountOutlineIcon,
} from '@mattermost/compass-icons/components';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {limitHelper} from 'mattermost-redux/utils/plans_util';

import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import {useNextPlan} from 'components/common/hooks/usePackLimitedFeature';
import * as Menu from 'components/menu';
import {OnboardingTourSteps} from 'components/tours';
import {useShowOnboardingTutorialStep, CreateAndJoinChannelsTour} from 'components/tours/onboarding_tour';
import PlusFilledIcon from 'components/widgets/icons/plus_filled_icon';

import {getHistory} from 'utils/browser_history';
import {isDesktopApp} from 'utils/user_agent';

export const ELEMENT_ID_FOR_BROWSE_OR_ADD_CHANNEL_MENU = 'browseOrAddChannelMenuButton';

type Props = {
    canCreateChannel: boolean;
    onCreateNewChannelClick: () => void;
    canJoinPublicChannel: boolean;
    onBrowseChannelClick: () => void;
    onOpenDirectMessageClick: () => void;
    canCreateCustomGroups: boolean;
    onCreateNewUserGroupClick: () => void;
    unreadFilterEnabled: boolean;
    onCreateNewCategoryClick: () => void;
    onInvitePeopleClick: () => void;
};

export default function SidebarBrowserOrAddChannelMenu(props: Props) {
    const {formatMessage} = useIntl();

    const showCreateAndJoinChannelsTutorialTip = useShowOnboardingTutorialStep(OnboardingTourSteps.CREATE_AND_JOIN_CHANNELS);
    const currentTeam = useSelector(getCurrentTeam);

    const goToIntegration = () => {
        getHistory().push(`/${currentTeam?.name}/integrations`);
    };

    const {sidebar_categories: sidebarCategories} = useGetUsageDeltas();

    const allowed = (
        <FormattedMessage
            id='sidebarLeft.browserOrCreateChannelMenu.createCategoryMenuItem.primaryLabel'
            defaultMessage='Create new category'
        />
    );

    const nextPlan = useNextPlan();
    const forbidden = (
        <span style={{whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <wc-ksuite-pro-upgrade-dialog offer={nextPlan}>
                <p slot='trigger-element'>
                    {allowed}
                    <wc-ksuite-pro-upgrade-tag/>
                </p>
            </wc-ksuite-pro-upgrade-dialog>
        </span>
    );
    const {component, onClick} = limitHelper(sidebarCategories, allowed, forbidden, props.onCreateNewCategoryClick);

    let createNewChannelMenuItem: JSX.Element | null = null;
    if (props.canCreateChannel) {
        createNewChannelMenuItem = (
            <Menu.Item
                id='createNewChannelMenuItem'
                onClick={props.onCreateNewChannelClick}
                leadingElement={<PlusIcon size={18}/>}
                labels={(
                    <FormattedMessage
                        id='sidebarLeft.browserOrCreateChannelMenu.createNewChannelMenuItem.primaryLabel'
                        defaultMessage='Create new channel'
                    />
                )}
                trailingElements={showCreateAndJoinChannelsTutorialTip && <CreateAndJoinChannelsTour/>}
            />
        );
    }

    let browseChannelsMenuItem: JSX.Element | null = null;
    if (props.canJoinPublicChannel) {
        browseChannelsMenuItem = (
            <Menu.Item
                id='browseChannelsMenuItem'
                onClick={props.onBrowseChannelClick}
                leadingElement={<GlobeIcon size={18}/>}
                labels={(
                    <FormattedMessage
                        id='sidebarLeft.browserOrCreateChannelMenu.browseChannelsMenuItem.primaryLabel'
                        defaultMessage='Browse channels'
                    />
                )}
            />
        );
    }

    const createDirectMessageMenuItem = (
        <Menu.Item
            id='openDirectMessageMenuItem'
            onClick={props.onOpenDirectMessageClick}
            leadingElement={<AccountOutlineIcon size={18}/>}
            labels={(
                <FormattedMessage
                    id='sidebarLeft.browserOrCreateChannelMenu.openDirectMessageMenuItem.primaryLabel'
                    defaultMessage='Open a direct message'
                />
            )}
        />
    );

    let createUserGroupMenuItem: JSX.Element | null = null;
    if (props.canCreateCustomGroups) {
        createUserGroupMenuItem = (
            <Menu.Item
                id='createUserGroupMenuItem'
                onClick={props.onCreateNewUserGroupClick}
                leadingElement={<AccountMultiplePlusOutlineIcon size={18}/>}
                labels={(
                    <FormattedMessage
                        id='sidebarLeft.browserOrCreateChannelMenu.createUserGroupMenuItem.primaryLabel'
                        defaultMessage='Create new user group'
                    />
                )}
            />
        );
    }

    let createNewCategoryMenuItem: JSX.Element | null = null;
    if (!props.unreadFilterEnabled) {
        createNewCategoryMenuItem = (
            <Menu.Item
                id='createCategoryMenuItem'
                onClick={onClick}
                leadingElement={<FolderPlusOutlineIcon size={18}/>}
                labels={component}
            />
        );
    }

    return (
        <Menu.Container
            menuButton={{
                id: ELEMENT_ID_FOR_BROWSE_OR_ADD_CHANNEL_MENU,
                'aria-label': formatMessage({
                    id: 'sidebarLeft.browserOrCreateChannelMenuButton.label',
                    defaultMessage: 'Browse or create channels',
                }),
                class: isDesktopApp() ? 'btn btn-icon btn-sm btn-tertiary btn-inverted btn-round' : 'sidebarHeaderContainer__dropdownButton',
                children: isDesktopApp() ? (
                    <PlusIcon size={18}/>
                ) : (
                    <>
                        <PlusFilledIcon/>
                        <FormattedMessage
                            id={'admin.user_grid.new'}
                            defaultMessage='New'
                        />
                    </>
                ),
            }}
            menuButtonTooltip={{
                text: formatMessage({id: 'sidebarLeft.browserOrCreateChannelMenuButton.label', defaultMessage: 'Browse or create channels'}),
            }}
            menu={{
                id: 'browserOrAddChannelMenu',
                'aria-labelledby': ELEMENT_ID_FOR_BROWSE_OR_ADD_CHANNEL_MENU,
            }}
            parentWidth={!isDesktopApp()}
        >
            {createNewChannelMenuItem}
            {browseChannelsMenuItem}
            {createDirectMessageMenuItem}
            {createUserGroupMenuItem}
            {Boolean(createNewCategoryMenuItem) &&
                <Menu.Separator/>
            }
            {createNewCategoryMenuItem}
            <Menu.Item
                id='integrations'
                labels={
                    <FormattedMessage
                        id='integrations.header'
                        defaultMessage='Integrations'
                    />
                }
                leadingElement={<GlobeIcon size={18}/>}
                onClick={goToIntegration}
            />
        </Menu.Container>
    );
}
