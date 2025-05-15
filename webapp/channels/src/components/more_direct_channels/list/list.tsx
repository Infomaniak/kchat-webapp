// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import isEqual from 'lodash/isEqual';
import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useMemo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {UserProfile} from '@mattermost/types/users';

import MultiSelect from 'components/multiselect';

import Constants from 'utils/constants';

import {usePrevious} from './hooks';

import ListItem from '../list_item';
import type {Option, OptionValue} from '../types';
import {optionValue} from '../types';

const MAX_SELECTABLE_VALUES = Constants.MAX_USERS_IN_GM;
export const USERS_PER_PAGE = 50;

export type Props = {
    addValue: (value: OptionValue) => void;
    children?: ReactNode;
    currentUserId: string;
    handleDelete: (values: OptionValue[]) => void;
    handlePageChange: (page: number, prevPage: number) => void;
    handleSubmit: (values?: OptionValue[]) => void;
    handleHide: () => void;
    isExistingChannel: boolean;
    loading: boolean;
    options: Option[];
    saving: boolean;
    search: (term: string) => void;
    selectedItemRef: React.RefObject<HTMLDivElement>;
    totalCount: number;
    users: UserProfile[];
    emptyGroupChannelsIds: string[];

    /**
     * An array of values that have been selected by the user in the multiselect.
     */
    values: OptionValue[];

    actions: {
        getProfilesInGroupChannels: (ids: string[]) => object;
    };
}

//@ts-expect-error Multiselect got a generic
const List = React.forwardRef((props: Props, ref?: React.Ref<MultiSelect<OptionValue>>) => {
    const renderOptionValue = useCallback((
        option: OptionValue,
        isSelected: boolean,
        add: (value: OptionValue) => void,
        select: (value: OptionValue) => void,
    ) => {
        return (
            <ListItem
                ref={isSelected ? props.selectedItemRef : undefined}
                key={'more_direct_channels_list_' + option.value}
                option={option}
                isSelected={isSelected}
                add={add}
                select={select}
            />
        );
    }, [props.selectedItemRef]);

    const handleSubmitImmediatelyOn = useCallback((value: OptionValue) => {
        return value.id === props.currentUserId || Boolean(value.delete_at);
    }, [props.currentUserId]);

    const intl = useIntl();
    const previousEmptyGroupIds = usePrevious(props.emptyGroupChannelsIds);

    let note;
    if (props.isExistingChannel) {
        if (props.values.length >= MAX_SELECTABLE_VALUES) {
            note = (
                <FormattedMessage
                    id='more_direct_channels.new_convo_note.full'
                    defaultMessage={'You\'ve reached the maximum number of people for this conversation. Consider creating a private channel instead.'}
                />
            );
        } else {
            note = (
                <FormattedMessage
                    id='more_direct_channels.new_convo_note'
                    defaultMessage={'This will start a new conversation. If you\'re adding a lot of people, consider creating a private channel instead.'}
                />
            );
        }
    }

    const options = useMemo(() => {
        return props.options.map(optionValue);
    }, [props.options]);

    useEffect(() => {
        if (props.emptyGroupChannelsIds.length > 0 && !isEqual(previousEmptyGroupIds, props.emptyGroupChannelsIds)) {
            props.actions.getProfilesInGroupChannels?.(props.emptyGroupChannelsIds);
        }
    }, [props.emptyGroupChannelsIds, props.actions, previousEmptyGroupIds]);

    return (

        // @ts-expect-error Multiselect has a generic
        <MultiSelect<OptionValue>
            ref={ref}
            options={options}
            optionRenderer={renderOptionValue}
            intl={intl}
            selectedItemRef={props.selectedItemRef}
            values={props.values}
            valueRenderer={renderValue}
            ariaLabelRenderer={renderAriaLabel}
            perPage={USERS_PER_PAGE}
            handlePageChange={props.handlePageChange}
            handleInput={props.search}
            handleDelete={props.handleDelete}
            handleAdd={props.addValue}
            handleSubmit={props.handleSubmit}
            noteText={note}
            disableMultiSelectList={props.values.length > (Constants.MAX_USERS_IN_GM - 1)}
            maxValues={MAX_SELECTABLE_VALUES}

            changeMessageColor='red'
            showError={props.values.length === MAX_SELECTABLE_VALUES}
            numRemainingText={
                props.values.length === MAX_SELECTABLE_VALUES ? (
                    <FormattedMessage
                        id='multiselect.noMorePeople'
                        defaultMessage='A personal message is limited to {maxUsers} people.'
                        values={{
                            maxUsers: (Constants.MAX_USERS_IN_GM - 1),
                        }}
                    />
                ) : (
                    <FormattedMessage
                        id='multiselect.numPeopleRemaining'
                        defaultMessage='Use the ↑↓ arrows on the keyboard, ENTER to select.'
                    />
                )
            }
            buttonSubmitText={
                <FormattedMessage
                    id='multiselect.go'
                    defaultMessage='Go'
                />
            }
            buttonSubmitLoadingText={
                <FormattedMessage
                    id='multiselect.loading'
                    defaultMessage='Loading...'
                />
            }
            submitImmediatelyOn={handleSubmitImmediatelyOn}
            saving={props.saving}
            loading={props.loading}
            users={props.users}
            totalCount={props.totalCount}
            placeholderText={intl.formatMessage({id: 'multiselect.placeholder', defaultMessage: 'Search and add members'})}

        >
            {props.children}
        </MultiSelect>
    );
});

export default List;

function renderValue(props: {data: OptionValue}) {
    return (props.data as UserProfile).username;
}

function renderAriaLabel(option: OptionValue) {
    return (option as UserProfile)?.username ?? '';
}
