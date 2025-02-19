// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo, useEffect} from 'react';
import type {ComponentProps, CSSProperties} from 'react';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';
import tinycolor from 'tinycolor2';

import type {UserProfile} from '@mattermost/types/users';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getUser as selectUser, makeDisplayNameGetter} from 'mattermost-redux/selectors/entities/users';

import SimpleTooltip, {useSynchronizedImmediate} from 'components/widgets/simple_tooltip';
import Avatar from 'components/widgets/users/avatar';

import {t} from 'utils/i18n';

import type {Conference} from 'types/conference';
import type {GlobalState} from 'types/store';

import UserAvatar from './user_avatar';
import {countMeta} from './utils';

import './avatars.scss';

type Props = {
    conference: Conference;
    currentUser: UserProfile;
    showCurrentUser?: boolean;
    totalUsers?: number;
    breakAt?: number;
    size?: ComponentProps<typeof Avatar>['size'];
    fetchMissingUsers?: boolean;
    disableProfileOverlay?: boolean;
    displayProfileStatus?: boolean;
    otherServerParticipants: UserProfile[];
};

const OTHERS_DISPLAY_LIMIT = 99;

const displayNameGetter = makeDisplayNameGetter();

function Avatars({
    conference,
    currentUser,
    size,
    disableProfileOverlay,
    displayProfileStatus,
    fetchMissingUsers,
    showCurrentUser = true,
    breakAt,
    otherServerParticipants,
}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const usersIds = useMemo(() => {
        if (otherServerParticipants && !conference) {
            return otherServerParticipants.map((user) => user.id);
        }
        if (conference && conference.registrants) {
            const ids = Object.keys(conference.registrants);
            if (currentUser && !showCurrentUser) {
                return ids.filter((id) => id !== currentUser.id);
            }

            return ids;
        }
        return [];
    }, [otherServerParticipants, conference, currentUser, showCurrentUser]);
    const [overlayProps, setImmediate] = useSynchronizedImmediate();
    const [displayUserIds, overflowUserIds, {overflowUnnamedCount, nonDisplayCount}] = countMeta(usersIds, breakAt);
    const overflowNames = useSelector((state: GlobalState) => {
        return overflowUserIds.map((userId) => displayNameGetter(state, true)(selectUser(state, userId))).join(', ');
    });

    const {centerChannelBg, centerChannelColor} = useSelector(getTheme);
    const avatarStyle: CSSProperties = useMemo(() => ({
        background: tinycolor.mix(centerChannelBg, centerChannelColor, 8).toRgbString(),
    }), [centerChannelBg, centerChannelColor]);

    useEffect(() => {
        if (fetchMissingUsers) {
            dispatch(getMissingProfilesByIds(usersIds));
        }
    }, [fetchMissingUsers, usersIds, dispatch]);

    if (!conference) {
        return <></>;
    }

    const renderUserAvatar = (userOrId: UserProfile | string) => {
        const isUserProfile = (userOrId: UserProfile | string): userOrId is UserProfile => typeof userOrId !== 'string';
        const user = isUserProfile(userOrId) ? userOrId : undefined;
        const id = isUserProfile(userOrId) ? userOrId.id : userOrId;
        const status = isUserProfile(userOrId) ? undefined : conference.registrants[id];
        const name = user ? user.nickname : undefined;
        const rootClose = !user;
        const disableFetch = Boolean(user);

        return (
            <UserAvatar
                key={id}
                user={user}
                name={name}
                style={avatarStyle}
                userId={id}
                size={size}
                overlayProps={overlayProps}
                rootClose={rootClose}
                disableFetch={disableFetch}
                status={status}
                displayProfileOverlay={Boolean(disableProfileOverlay)}
                displayProfileStatus={Boolean(displayProfileStatus)}
            />
        );
    };

    return (
        <div
            className={`Avatars Avatars___${size}`}
            onMouseLeave={() => setImmediate(false)}
        >
            {(otherServerParticipants?.length > 0 ? otherServerParticipants : displayUserIds).map(renderUserAvatar)}
            {Boolean(nonDisplayCount) && (
                <SimpleTooltip
                    id={'names-overflow'}
                    {...overlayProps}
                    content={overflowUserIds.length ? formatMessage(
                        {
                            id: t('avatars.overflowUsers'),
                            defaultMessage: '{overflowUnnamedCount, plural, =0 {{names}} =1 {{names} and one other} other {{names} and # others}}',
                        },
                        {
                            overflowUnnamedCount,
                            names: overflowNames,
                        },
                    ) : formatMessage(
                        {
                            id: t('avatars.overflowUnnamedOnly'),
                            defaultMessage: '{overflowUnnamedCount, plural, =1 {one other} other {# others}}',
                        },
                        {overflowUnnamedCount},
                    )}
                >
                    <Avatar
                        style={avatarStyle}
                        size={size}
                        tabIndex={0}
                        text={nonDisplayCount > OTHERS_DISPLAY_LIMIT ? `${OTHERS_DISPLAY_LIMIT}+` : `+${nonDisplayCount}`}
                    />
                </SimpleTooltip>
            )}
        </div>
    );
}

export default memo(Avatars);
