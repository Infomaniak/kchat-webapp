// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useCallback, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import type {SchedulingInfo} from '@mattermost/types/schedule_post';

import {getCloudLimits} from 'mattermost-redux/selectors/entities/cloud';
import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import {quotaGate} from 'mattermost-redux/utils/plans_util';

import {openModal} from 'actions/views/modals';

import CoreMenuOptions from 'components/advanced_text_editor/send_button/send_post_options/core_menu_options';
import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import * as Menu from 'components/menu';

import {ModalIdentifiers} from 'utils/constants';

import ScheduledPostCustomTimeModal from '../scheduled_post_custom_time_modal/scheduled_post_custom_time_modal';

import './style.scss';

type Props = {
    channelId: string;
    disabled?: boolean;
    onSelect: (schedulingInfo: SchedulingInfo) => void;
    transformOriginVertical?: 'top' | 'bottom';
    anchorOrigin?: 'top' | 'bottom';
    menuIcon?: React.ReactNode;
    menuButtonClassName?: string;
}

export function SendPostOptions({disabled, onSelect, channelId, transformOriginVertical, anchorOrigin, menuIcon, menuButtonClassName}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const [isUpdating, setIsUpdating] = useState(false);

    const handleOnSelect = useCallback((e: React.FormEvent, scheduledAt: number) => {
        e.preventDefault();
        e.stopPropagation();

        const schedulingInfo: SchedulingInfo = {
            scheduled_at: scheduledAt,
        };

        onSelect(schedulingInfo);
    }, [onSelect]);

    const handleSelectCustomTime = useCallback((scheduledAt: number) => {
        const schedulingInfo: SchedulingInfo = {
            scheduled_at: scheduledAt,
        };

        onSelect(schedulingInfo);
        return Promise.resolve({});
    }, [onSelect]);

    const handleChooseCustomTime = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.SCHEDULED_POST_CUSTOM_TIME_MODAL,
            dialogType: ScheduledPostCustomTimeModal,
            dialogProps: {
                channelId,
                onConfirm: handleSelectCustomTime,
            },
        }));
    }, [channelId, dispatch, handleSelectCustomTime]);

    const {scheduled_draft_custom_date: scheduledDraftCustomDate} = useGetUsageDeltas();
    const {scheduled_draft_custom_date: scheduledDraftCustomDateIsLimited} = useSelector(getCloudLimits);
    const currentPack = useSelector(getCurrentPackName);
    const {isQuotaExceeded, withQuotaCheck} = quotaGate(scheduledDraftCustomDate, currentPack);

    return (
        <Menu.Container
            style={{visibility: isUpdating ? 'hidden' : 'visible'}} // avoid blinking menu
            menuButtonTooltip={{
                text: formatMessage({
                    id: 'create_post_button.option.schedule_message',
                    defaultMessage: 'Schedule message',
                }),
                disabled,
            }}
            menuButton={{
                id: 'button_send_post_options',
                class: menuButtonClassName ?? classNames('button_send_post_options', {disabled}),
                children: menuIcon ?? <ChevronDownIcon size={16}/>,
                disabled,
                'aria-label': formatMessage({
                    id: 'create_post_button.option.schedule_message',
                    defaultMessage: 'Schedule message',
                }),
            }}
            menu={{
                id: 'dropdown_send_post_options',
            }}
            transformOrigin={{
                horizontal: 'right',
                vertical: transformOriginVertical ?? 'bottom',
            }}
            anchorOrigin={{
                vertical: anchorOrigin ?? 'top',
                horizontal: 'right',
            }}
        >
            <Menu.Item
                disabled={true}
                labels={
                    <FormattedMessage
                        id='create_post_button.option.schedule_message.options.header'
                        defaultMessage='Scheduled message'
                    />
                }
            />

            <CoreMenuOptions
                handleOnSelect={handleOnSelect}
                channelId={channelId}
                allowCustom={scheduledDraftCustomDateIsLimited}
            />

            <Menu.Separator/>

            <Menu.Item
                onClick={withQuotaCheck(handleChooseCustomTime)}
                key={'choose_custom_time'}
                labels={(
                    <FormattedMessage
                        id='create_post_button.option.schedule_message.options.choose_custom_time'
                        defaultMessage='Choose a custom time'
                    />
                )}
                trailingElements={isQuotaExceeded && (
                    <wc-ksuite-pro-upgrade-tag
                        ref={forceResizeOnMount(setIsUpdating)}
                    />
                )}
            />

        </Menu.Container>
    );
}

// This is a bit of a hack to handle layout issues caused by the web component:
// We trigger a resize event,
// forcing the menu to recalculate positioning.
// The isUpdating state helps prevent UI flicker during this forced update.
function forceResizeOnMount(setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>) {
    return (el: HTMLElement | null) => {
        if (!el) {
            return;
        }

        setIsUpdating(true);
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            setIsUpdating(false);
        }, 20);
    };
}

