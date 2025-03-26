// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import CloseSuiteSidepanel from 'components/close_suite_sidepanel';

import ChannelInfoButton from './channel_info_button';
import CollapseLhsButton from './collapse_lhs_button';
import CollapseRhsButton from './collapse_rhs_button';
import ShowSearchButton from './show_search_button';
import UnmuteChannelButton from './unmute_channel_button';

import ChannelHeaderMenu from '../channel_header_menu/channel_header_menu';
import MobileChannelHeaderPlugins from '../channel_header_menu/menu_items/mobile_channel_header_plugins';
import FlagNext from 'components/flag_next';

type Props = {
    channel?: Channel;

    inGlobalThreads?: boolean;
    inDrafts?: boolean;
    isMobileView: boolean;
    isMuted?: boolean;
    isRHSOpen?: boolean;
    user: UserProfile;
    isChannelMember?: boolean;
    actions: {
        closeLhs: () => void;
        closeRhs: () => void;
        closeRhsMenu: () => void;
    };
}

export default class ChannelHeaderMobile extends React.PureComponent<Props> {
    componentDidMount() {
        document.querySelector('.inner-wrap')?.addEventListener('click', this.hideSidebars);
    }

    componentWillUnmount() {
        document.querySelector('.inner-wrap')?.removeEventListener('click', this.hideSidebars);
    }

    hideSidebars = (e: Event) => {
        if (this.props.isMobileView) {
            if (this.props.isRHSOpen) {
                this.props.actions.closeRhs();
            }

            const target = e.target as HTMLElement | undefined;

            if (target && target.className !== 'navbar-toggle' && target.className !== 'icon-bar') {
                this.props.actions.closeLhs();
                this.props.actions.closeRhsMenu();
            }
        }
    };

    render() {
        const {user, channel, isMuted, inGlobalThreads, inDrafts, isChannelMember} = this.props;

        let heading;
        if (inGlobalThreads) {
            heading = (
                <FormattedMessage
                    id='globalThreads.heading'
                    defaultMessage='Followed threads'
                />
            );
        } else if (inDrafts) {
            heading = (
                <FormattedMessage
                    id='drafts.heading'
                    defaultMessage='Drafts'
                />
            );
        } else if (channel) {
            heading = isChannelMember && ( // display the header features only fro members, not in the preview mode.
                <>
                    <ChannelHeaderMenu
                        isMobile={true}
                    />

                    {isMuted && (
                        <UnmuteChannelButton
                            user={user}
                            channel={channel}
                        />
                    )}
                </>
            );
        }

        return (
            <nav
                id='navbar'
                className='navbar navbar-default navbar-fixed-top'
                role='navigation'
            >
                <div className='container-fluid theme'>
                    <div className='navbar-header'>
                        <CollapseLhsButton/>
                        <div className={classNames('navbar-brand', {GlobalThreads___title: inGlobalThreads})}>
                            {heading}
                        </div>
                        <div className='spacer'/>
                        {channel && (
                            <ChannelInfoButton
                                channel={channel}
                            />
                        )}
                        {channel && (
                            <MobileChannelHeaderPlugins
                                channel={channel}
                                isDropdown={false}
                            />
                        )}
                        <ShowSearchButton/>
                        <CollapseRhsButton/>
                        <CloseSuiteSidepanel/>
                        <FlagNext/>
                    </div>
                </div>
            </nav>
        );
    }
}
