// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';
import {CSSTransition} from 'react-transition-group';
import styled from 'styled-components';

import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';

import TasklistDoneIcon from './tasklist_done_icon';

const CompletedWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 24px 0px 24px;
    margin: auto;
    text-align: center;
    word-break: break-word;
    width: 100%;

    &.fade-enter {
        transform: scale(0);
    }
    &.fade-enter-active {
        transform: scale(1);
    }
    &.fade-enter-done {
        transform: scale(1);
    }
    &.fade-exit {
        transform: scale(1);
    }
    &.fade-exit-active {
        transform: scale(1);
    }
    &.fade-exit-done {
        transform: scale(1);
    }
    .start-trial-btn, button {
        padding: 13px 20px;
        background: var(--button-bg);
        border-radius: 4px;
        color: var(--sidebar-text);
        border: none;
        font-weight: bold;
        margin-top: 15px;
        min-height: 40px;
        &:hover {
            background: var(--button-bg) !important;
            color: var(--sidebar-text) !important;
        }
    }

    h2 {
        font-size: 20px;
        margin: 20px 0 10px;
        font-weight: 600;
    }

    .start-trial-text, .completed-subtitle {
        font-size: 14px !important;
        color: rgba(var(--center-channel-color-rgb), 0.72);
        line-height: 20px;
    }

    .completed-subtitle {
        margin-top: 5px;
    }

    .disclaimer, .download-apps {
        width: 90%;
        margin-top: 15px;
        color: rgba(var(--center-channel-color-rgb), 0.72);
        font-family: "SuisseIntl";
        font-style: normal;
        font-weight: normal;
        line-height: 16px;
    }

    .disclaimer {
        text-align: left;
        margin-top: auto;
        font-size: 11px;
    }

    .download-apps {
        margin-top: 24px;
        width: 200px;
        font-size: 12px;
    }
`;

interface Props {
    dismissAction: () => void;
    isCurrentUserSystemAdmin: boolean;
    isFirstAdmin: boolean;
}

const Completed = (props: Props): JSX.Element => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPrevTrialLicense());
    }, []);

    return (
        <>
            <CSSTransition
                in={true}
                timeout={150}
                classNames='fade'
            >
                <CompletedWrapper>
                    <TasklistDoneIcon/>
                    <h2>
                        <FormattedMessage
                            id={'onboardingTour.taskList.completed.title'}
                            defaultMessage='Well done. You’ve completed all of the tasks!'
                        />
                    </h2>
                    <span className='completed-subtitle'>
                        <FormattedMessage
                            id={'onboardingTour.taskList.completed.subtitle'}
                            defaultMessage='We hope Mattermost is more familiar now.'
                        />
                    </span>
                </CompletedWrapper>
            </CSSTransition>
        </>
    );
};

export default Completed;
