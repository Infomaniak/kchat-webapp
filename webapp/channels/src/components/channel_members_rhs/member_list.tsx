// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useRef, useState} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList} from 'react-window';
import type {ListChildComponentProps} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import type {Channel, PendingGuest as PendingGuestType} from '@mattermost/types/channels';
import type {Group} from '@mattermost/types/groups';
import type {UserProfile} from '@mattermost/types/users';

import type {ChannelMember, ListItem} from './channel_members_rhs';
import {ListItemType} from './channel_members_rhs';
import GroupItem from './group_item';
import Member, {PendingGuest} from './member';

export interface Props {
    channel: Channel;
    members: ListItem[];
    editing: boolean;
    canRemoveGroups: boolean;
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    searchTerms: string;
    openDirectMessage: (user: UserProfile) => void;
    loadMore: () => void;
}

interface ItemData {
    members: ListItem[];
    channel: Channel;
    editing: boolean;
    canRemoveGroups: boolean;
    openDirectMessage: (user: UserProfile) => void;
}

interface ItemProps extends ListChildComponentProps {
    data: ItemData;
}

const Item = ({index, style, data}: ItemProps) => {
    const {members, channel, editing, canRemoveGroups, openDirectMessage} = data;

    if (!(index in members)) {
        return null;
    }

    switch (members[index].type) {
    case ListItemType.Member: {
        const member = members[index].data as ChannelMember;
        return (
            <div
                style={style}
                key={member.user.id}
            >
                <Member
                    channel={channel}
                    index={index}
                    totalUsers={members.filter((l) => l.type === ListItemType.Member).length}
                    member={member}
                    editing={editing}
                    actions={{openDirectMessage}}
                />
            </div>
        );
    }
    case ListItemType.PendingGuest: {
        const pendingGuest = members[index].data as PendingGuestType;
        return (
            <div
                style={style}
                key={`pending-guest-${pendingGuest.id}`}
            >
                <PendingGuest
                    channel={channel}
                    pendingGuest={pendingGuest}
                    editing={editing}
                    index={index}
                    totalUsers={members.length}
                />
            </div>
        );
    }
    case ListItemType.Group: {
        const group = members[index].data as Group;
        return (
            <div
                style={style}
                key={`group-${group.id}`}
            >
                <GroupItem
                    group={group}
                    editing={editing}
                    canRemove={canRemoveGroups}
                />
            </div>
        );
    }
    case ListItemType.Separator:
    case ListItemType.FirstSeparator:
        return (
            <div
                key={index}
                style={style}
            >
                {members[index].data}
            </div>
        );
    default:
        return null;
    }
};

const MemberList = ({
    hasNextPage,
    isNextPageLoading,
    channel,
    members,
    searchTerms,
    editing,
    canRemoveGroups,
    openDirectMessage,
    loadMore,
}: Props) => {
    const infiniteLoaderRef = useRef<InfiniteLoader | null>(null);
    const variableSizeListRef = useRef<VariableSizeList | null>(null);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        if (hasMounted) {
            if (infiniteLoaderRef.current) {
                infiniteLoaderRef.current.resetloadMoreItemsCache();
            }
            if (variableSizeListRef.current) {
                variableSizeListRef.current.resetAfterIndex(0);
            }
        }
        setHasMounted(true);
    }, [searchTerms, members.length, hasMounted]);

    const itemCount = hasNextPage ? members.length + 1 : members.length;

    const loadMoreItems = isNextPageLoading ? () => {} : loadMore;

    const isItemLoaded = (index: number) => {
        return !hasNextPage || index < members.length;
    };

    const getItemSize = (index: number) => {
        if (!(index in members)) {
            return 0;
        }

        switch (members[index].type) {
        case ListItemType.FirstSeparator:
            return 28;
        case ListItemType.Separator:
            return 16 + 28;
        case ListItemType.Group:
            return 48;
        }

        return 48;
    };

    const itemData: ItemData = {
        members,
        channel,
        editing,
        canRemoveGroups,
        openDirectMessage,
    };

    if (members.length === 0) {
        return null;
    }

    return (
        <AutoSizer>
            {({height, width}) => (
                <InfiniteLoader
                    ref={infiniteLoaderRef}
                    isItemLoaded={isItemLoaded}
                    itemCount={itemCount}
                    loadMoreItems={loadMoreItems}
                >
                    {({onItemsRendered, ref}) => (

                        <VariableSizeList
                            itemCount={itemCount}
                            onItemsRendered={onItemsRendered}
                            ref={(list) => {
                                ref(list);
                                variableSizeListRef.current = list;
                            }}
                            itemData={itemData}
                            itemSize={getItemSize}
                            height={height}
                            width={width}
                        >
                            {Item}
                        </VariableSizeList>
                    )}
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
};

export default memo(MemberList);
