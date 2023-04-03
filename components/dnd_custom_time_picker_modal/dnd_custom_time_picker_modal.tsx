// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Moment} from 'moment-timezone';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {UserStatus} from '@mattermost/types/users';

import GenericModal from 'components/generic_modal';

import {UserStatuses} from 'utils/constants';
import DateTimeInputContainer, {getRoundedTime} from 'components/custom_status/date_time_input';

import {toUTCUnix} from 'utils/datetime';
import {localizeMessage} from 'utils/utils';
import {getCurrentMomentForTimezone} from 'utils/timezone';

import './dnd_custom_time_picker_modal.scss';

type Props = {
    onExited: () => void;
    userId: string;
    currentDate: Date;
    timezone?: string;
    actions: {
        setStatus: (status: UserStatus) => ActionFunc;
    };
};

type State = {
    time: Moment;
    isMenuOpen: boolean;
}

export default class DndCustomTimePicker extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        const currentTime = getCurrentMomentForTimezone(props.timezone);
        const initialTime = getRoundedTime(currentTime);
        this.state = {
            time: initialTime,
            isMenuOpen: false,
        };
    }

    getText = () => {
        const modalHeaderText = (
            <FormattedMessage
                id='dnd_custom_time_picker_modal.defaultMsg'
                defaultMessage='Disable notifications until'
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='dnd_custom_time_picker_modal.submitButton'
                defaultMessage='Disable Notifications'
            />
        );

        return {
            modalHeaderText,
            confirmButtonText,
        };
    }

    handleConfirm = () => {
        this.props.actions.setStatus({
            user_id: this.props.userId,
            status: UserStatuses.DND,
            dnd_end_time: toUTCUnix(this.state.time.toDate()),
            manual: true,
            last_activity_at: toUTCUnix(this.props.currentDate),
        });
    }

    setTime = (time: Moment) => this.setState({time});

    setIsMenuOpen = (isMenuOpen: boolean) => this.setState({isMenuOpen});

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();
        const {time, isMenuOpen} = this.state;

        return (
            <GenericModal
                ariaLabel={localizeMessage('dnd_custom_time_picker_modal.defaultMsg', 'Disable notifications until')}
                onExited={this.props.onExited}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                handleConfirm={this.handleConfirm}
                handleEnterKeyPress={this.handleConfirm}
                id='dndCustomTimePickerModal'
                className={'DndModal modal-overflow'}
                isConfirmDisabled={isMenuOpen}
            >
                <DateTimeInputContainer
                    time={time}
                    timezone={this.props.timezone}
                    handleChange={this.setTime}
                    onMenuChange={this.setIsMenuOpen}
                />
            </GenericModal>
        );
    }
}
