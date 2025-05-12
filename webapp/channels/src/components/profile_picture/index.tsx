// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {useSelector} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {getUser as selectUser} from 'mattermost-redux/selectors/entities/users';

import ProfilePopover from 'components/profile_popover';
import StatusIcon from 'components/status_icon';
import StatusIconNew from 'components/status_icon_new';
import Avatar, {getAvatarWidth} from 'components/widgets/users/avatar';
import type {TAvatarSizeToken} from 'components/widgets/users/avatar';

import type {GlobalState} from '../../types/store';

type Props = {
    size?: TAvatarSizeToken;
    isEmoji?: boolean;
    wrapperClass?: string;
    profileSrc?: string;
    src: string;
    isBot?: boolean;
    fromAutoResponder?: boolean;
    status?: string;
    fromWebhook?: boolean;
    userId?: string;
    channelId?: string;
    username?: string;
    overwriteIcon?: string;
    overwriteName?: string;
    newStatusIcon?: boolean;
    statusClass?: string;
}

function ProfilePicture(props: Props) {
    // profileSrc will, if possible, be the original user profile picture even if the icon
    // for the post is overriden, so that the popup shows the user identity
    const profileSrc = typeof props.profileSrc === 'string' && props.profileSrc !== '' ? props.profileSrc : props.src;

    const profileIconClass = `profile-icon ${props.isEmoji ? 'emoji' : ''}`;

    const hideStatus = props.isBot || props.fromAutoResponder || props.fromWebhook;
    if (props.userId) {
        const user = useSelector((state: GlobalState) => selectUser(state, props.userId!)) as UserProfile | undefined;

        return (
            <ProfilePopover
                user={user}
                username={props.username}
                hideStatus={hideStatus}
                triggerComponentClass={classNames('status-wrapper style--none', props.wrapperClass)}
                overwriteIcon={props.overwriteIcon || profileSrc}
                overwriteName={props.overwriteName}
                triggerComponentStyle={{
                    borderRadius: '50%',
                    width: `${getAvatarWidth(props?.size ?? 'md')}px`,
                    height: `${getAvatarWidth(props?.size ?? 'md')}px`,
                } as CSSStyleDeclaration}
            >
                <>
                    <span
                        className={profileIconClass}
                        slot='trigger'
                    >
                        <Avatar
                            username={props.username}
                            size={props.size}
                            url={props.src}
                        />
                    </span>
                    <StatusIcon status={props.status} slot="trigger"/>
                </>
            </ProfilePopover>
        );
    }

    return (
        <span
            className={classNames('status-wrapper', 'style--none', props.wrapperClass)}
        >
            <span className={profileIconClass}>
                <Avatar
                    size={props?.size ?? 'md'}
                    url={props.src}
                />
            </span>
            {props.newStatusIcon ? (
                <StatusIconNew
                    className={props.statusClass}
                    status={props.status}
                />
            ) : (
                <StatusIcon status={props.status}/>
            )}
        </span>
    );
}

export default ProfilePicture;
