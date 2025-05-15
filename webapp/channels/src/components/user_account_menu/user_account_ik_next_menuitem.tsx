// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Icon from '@infomaniak/compass-components/foundations/icon';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Menu from 'components/menu';
import ToggleModalButton from 'components/toggle_modal_button';
import ToggleNextModal from 'components/toggle_next_modal';

import {ModalIdentifiers} from 'utils/constants';

export default function UserAccountIkNextMenuItem() {
    // const onboardingTaskStep = useSelector((state: GlobalState) => getInt(state, OnboardingTaskCategory, OnboardingTasksName.COMPLETE_YOUR_PROFILE, 0));
    // const isCompleteYourProfileTaskPending = onboardingTaskStep === TaskNameMapToSteps[OnboardingTasksName.COMPLETE_YOUR_PROFILE].STARTED;

    // function handleClick() {
    //     dispatch(openModal({
    //         modalId: ModalIdentifiers.USER_SETTINGS,
    //         dialogType: UserSettingsModal,
    //         dialogProps: {isContentProductSettings: false, focusOriginElement: 'userAccountMenuButton'},
    //     }));
    // }

    // function handleTourClick() {
    //     const taskName = OnboardingTasksName.COMPLETE_YOUR_PROFILE;
    //     const steps = TaskNameMapToSteps[taskName];

    //     dispatch(savePreferences(props.userId, [{
    //         user_id: props.userId,
    //         category: OnboardingTaskCategory,
    //         name: taskName,
    //         value: steps.FINISHED.toString(),
    //     }]));
    // }

    const isNext = document.cookie.indexOf('KCHAT_NEXT=always') !== -1;

    return (
        <Menu.Item
            leadingElement={
                <Icon
                    size={16}
                    glyph={'laptop'}
                />
            }
            labels={
                <ToggleModalButton
                    ariaLabel={'ariaLabel'}
                    modalId={ModalIdentifiers.TOGGLE_NEXT}
                    dialogType={ToggleNextModal}
                >
                    <FormattedMessage
                        id='toggle_next_modal.title'
                        defaultMessage='Switch to {version} version'
                        values={{
                            version: isNext ? 'STABLE' : 'NEXT',
                        }}
                    />
                </ToggleModalButton>

            }

            className='userAccountMenu__ik-next-switch'

            aria-haspopup={true}
        />
    );
}
