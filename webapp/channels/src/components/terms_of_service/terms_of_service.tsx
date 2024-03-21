// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Button} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import type {RouteComponentProps} from 'react-router';

import type {TermsOfService as ReduxTermsOfService} from '@mattermost/types/terms_of_service';

import type {ActionResult} from 'mattermost-redux/types/actions';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import * as GlobalActions from 'actions/global_actions';

import AnnouncementBar from 'components/announcement_bar';
import LoadingScreen from 'components/loading_screen';
import LogoutIcon from 'components/widgets/icons/fa_logout_icon';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import {getHistory} from 'utils/browser_history';
import {Constants} from 'utils/constants';
import type EmojiMap from 'utils/emoji_map';
import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting';

export interface UpdateMyTermsOfServiceStatusResponse {
    terms_of_service_create_at: number;
    terms_of_service_id: string;
    user_id: number;
}

export interface TermsOfServiceProps extends RouteComponentProps {
    termsEnabled: boolean;
    actions: {
        getTermsOfService: () => Promise<ActionResult<ReduxTermsOfService>>;
        updateMyTermsOfServiceStatus: (
            termsOfServiceId: string,
            accepted: boolean
        ) => Promise<ActionResult>;
    };
    emojiMap: EmojiMap;
    onboardingFlowEnabled: boolean;
}

interface TermsOfServiceState {
    customTermsOfServiceId: string;
    customTermsOfServiceText: string;
    loading: boolean;
    loadingAgree: boolean;
    loadingDisagree: boolean;
    serverError: React.ReactNode;
}

export default class TermsOfService extends React.PureComponent<TermsOfServiceProps, TermsOfServiceState> {
    formattedText: (text: string) => string;

    constructor(props: TermsOfServiceProps) {
        super(props);

        this.state = {
            customTermsOfServiceId: '',
            customTermsOfServiceText: '',
            loading: true,
            loadingAgree: false,
            loadingDisagree: false,
            serverError: null,
        };

        this.formattedText = memoizeResult((text: string) => formatText(text, {}, props.emojiMap));
    }

    componentDidMount(): void {
        if (this.props.termsEnabled) {
            this.getTermsOfService();
        } else {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }

    getTermsOfService = async (): Promise<void> => {
        this.setState({
            customTermsOfServiceId: '',
            customTermsOfServiceText: '',
            loading: true,
        });
        const {data} = await this.props.actions.getTermsOfService();
        if (data) {
            this.setState({
                customTermsOfServiceId: data.id,
                customTermsOfServiceText: data.text,
                loading: false,
            });
        } else {
            GlobalActions.emitUserLoggedOutEvent(`/login?extra=${Constants.GET_TERMS_ERROR}`);
        }
    };

    handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
        e.preventDefault();
        GlobalActions.emitUserLoggedOutEvent('/login');
    };

    handleAcceptTerms = (): void => {
        this.setState({
            loadingAgree: true,
            serverError: null,
        });
        this.registerUserAction(
            true,
            () => {
                const query = new URLSearchParams(this.props.location?.search);
                const redirectTo = query.get('redirect_to');
                if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
                    getHistory().push(redirectTo);
                } else if (this.props.onboardingFlowEnabled) {
                    // need info about whether admin or not,
                    // and whether admin has already completed
                    // first time onboarding. Instead of fetching and orchestrating that here,
                    // let the default root component handle it.
                    getHistory().push('/');
                } else {
                    GlobalActions.redirectUserToDefaultTeam();
                }
            },
        );
    };

    handleRejectTerms = (): void => {
        this.setState({
            loadingDisagree: true,
            serverError: null,
        });
        this.registerUserAction(
            false,
            () => {
                GlobalActions.emitUserLoggedOutEvent(`/login?extra=${Constants.TERMS_REJECTED}`);
            },
        );
    };

    registerUserAction = async (accepted: boolean, success: (data: UpdateMyTermsOfServiceStatusResponse) => void): Promise<void> => {
        const {data} = await this.props.actions.updateMyTermsOfServiceStatus(this.state.customTermsOfServiceId, accepted);
        if (data) {
            success(data);
        } else {
            this.setState({
                loadingAgree: false,
                loadingDisagree: false,
                serverError: (
                    <FormattedMessage
                        id='terms_of_service.api_error'
                        defaultMessage='Unable to complete the request. If this issue persists, contact your System Administrator.'
                    />
                ),
            });
        }
    };

    render(): JSX.Element {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        let termsMarkdownClasses = 'terms-of-service__markdown';
        if (this.state.serverError) {
            termsMarkdownClasses += ' terms-of-service-error__height--fill';
        } else {
            termsMarkdownClasses += ' terms-of-service__height--fill';
        }
        return (
            <div className='signup-page-container'>
                <AnnouncementBar/>
                <div className='signup-header'>
                    <a
                        href='#'
                        onClick={this.handleLogoutClick}
                    >
                        <LogoutIcon/>
                        <FormattedMessage
                            id='web.header.logout'
                            defaultMessage='Logout'
                        />
                    </a>
                </div>
                <div className='signup-team__container terms-of-service__container'>
                    <div className={termsMarkdownClasses}>
                        <div
                            className='medium-center'
                            data-testid='termsOfService'
                        >
                            {messageHtmlToComponent(this.formattedText(this.state.customTermsOfServiceText), {mentions: false})}
                        </div>
                    </div>
                    <div className='terms-of-service__footer medium-center'>
                        <div className='terms-of-service__button-group'>
                            <Button
                                bsStyle={'primary'}
                                disabled={this.state.loadingAgree || this.state.loadingDisagree}
                                id='acceptTerms'
                                onClick={this.handleAcceptTerms}
                                type='submit'
                            >
                                {this.state.loadingAgree && <LoadingSpinner/>}
                                <FormattedMessage
                                    id='terms_of_service.agreeButton'
                                    defaultMessage={'I Agree'}
                                />
                            </Button>
                            <Button
                                bsStyle={'default'}
                                className='btn-quaternary'
                                disabled={this.state.loadingAgree || this.state.loadingDisagree}
                                id='rejectTerms'
                                onClick={this.handleRejectTerms}
                                type='reset'
                            >
                                {this.state.loadingDisagree && <LoadingSpinner/>}
                                <FormattedMessage
                                    id='terms_of_service.disagreeButton'
                                    defaultMessage={'I Disagree'}
                                />
                            </Button>
                        </div>
                        {Boolean(this.state.serverError) && (
                            <div className='terms-of-service__server-error alert alert-warning'>
                                <WarningIcon/>
                                {' '}
                                {this.state.serverError}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
