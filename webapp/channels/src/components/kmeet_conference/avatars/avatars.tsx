// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo} from 'react';
import type {ComponentProps, CSSProperties} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import tinycolor from 'tinycolor2';

import type {UserProfile} from '@mattermost/types/users';

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
    otherServerParticipants?: UserProfile[];
    conferenceParticipants?: UserProfile[];
};

const OTHERS_DISPLAY_LIMIT = 99;

const displayNameGetter = makeDisplayNameGetter();

function KMeetAvatars({
    conference,
    size,
    disableProfileOverlay,
    displayProfileStatus,
    breakAt,
    otherServerParticipants,
    conferenceParticipants,
}: Props) {
    const {formatMessage} = useIntl();

    const usersIds = useMemo(() => {
        if (conference && conference.registrants) {
            return Object.keys(conference.registrants);
        }
        return [];
    }, [conference]);

    const usersToDisplay = useMemo(() => {
        if (conference && conference.registrants) {
            return conferenceParticipants;
        }

        if (otherServerParticipants) {
            return otherServerParticipants;
        }
        return [];
    }, [conference, otherServerParticipants, conferenceParticipants]);

    const [overlayProps, setImmediate] = useSynchronizedImmediate();
    const [, overflowUserIds, {overflowUnnamedCount, nonDisplayCount}] = countMeta(usersIds, breakAt);
    const overflowNames = useSelector((state: GlobalState) => {
        return overflowUserIds.map((userId) => displayNameGetter(state, true)(selectUser(state, userId))).join(', ');
    });

    const {centerChannelBg, centerChannelColor} = useSelector(getTheme);
    const avatarStyle: CSSProperties = useMemo(() => ({
        background: tinycolor.mix(centerChannelBg, centerChannelColor, 8).toRgbString(),
    }), [centerChannelBg, centerChannelColor]);

    return (
        <div
            className={`Avatars Avatars___${size}`}
            onMouseLeave={() => setImmediate(false)}
        >
            {usersToDisplay?.map((user) => (
                <UserAvatar
                    style={avatarStyle}
                    key={user.id}
                    user={user}
                    size={size}
                    overlayProps={overlayProps}
                    status={conference && conference.registrants ? conference.registrants[user.id] : undefined}
                    displayProfileOverlay={Boolean(disableProfileOverlay)}
                    displayProfileStatus={Boolean(displayProfileStatus)}
                />
            ))}
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

export default memo(KMeetAvatars);
