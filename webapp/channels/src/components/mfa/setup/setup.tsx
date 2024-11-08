// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessage, FormattedMessage} from 'react-intl';

import type {UserProfile} from '@mattermost/types/users';

import ExternalLink from 'components/external_link';
import LocalizedPlaceholderInput from 'components/localized_placeholder_input';

type MFAControllerState = {
    enforceMultifactorAuthentication: boolean;
};

type Props = {

    /*
     * Object containing enforceMultifactorAuthentication
     */
    state: MFAControllerState;

    /*
     * Function that updates parent component with state props
     */
    updateParent: (state: MFAControllerState) => void;

    currentUser: UserProfile;
    siteName?: string;
    enforceMultifactorAuthentication: boolean;
    actions: {
        activateMfa: (code: string) => Promise<{
            error?: {
                server_error_id: string;
                message: string;
            };
        }>;
        generateMfaSecret: () => Promise<{
            data: {
                secret: string;
                qr_code: string;
            };
            error?: {
                message: string;
            };
        }>;
    };
    history: {
        push(path: string): void;
    };
}

type State = {
    secret: string;
    qrCode: string;
    error: React.ReactNode;
    serverError?: string;
}

export default class Setup extends React.PureComponent<Props, State> {
    private input: React.RefObject<HTMLInputElement>;

    public constructor(props: Props) {
        super(props);

        this.state = {
            error: undefined,
            secret: '',
            qrCode: '',
        };

        this.input = React.createRef();
    }

    public componentDidMount(): void {
        const user = this.props.currentUser;
        if (!user || user.mfa_active) {
            this.props.history.push('/');
            return;
        }

        this.props.actions.generateMfaSecret().then(({data, error}) => {
            if (error) {
                this.setState({
                    serverError: error.message,
                });
                return;
            }

            this.setState({
                secret: data.secret,
                qrCode: data.qr_code,
            });
        });
    }

    submit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const code = this.input?.current?.value.replace(/\s/g, '');
        if (!code || code.length === 0) {
            this.setState({
                error: (
                    <FormattedMessage
                        id='mfa.setup.codeError'
                        defaultMessage='Please enter the code from Google Authenticator.'
                    />
                ),
            });
            return;
        }

        this.setState({error: null});

        this.props.actions.activateMfa(code).then(({error}) => {
            if (error) {
                if (error.server_error_id === 'ent.mfa.activate.authenticate.app_error') {
                    this.setState({
                        error: (
                            <FormattedMessage
                                id='mfa.setup.badCode'
                                defaultMessage='Invalid code. If this issue persists, contact your System Administrator.'
                            />
                        ),
                    });
                } else {
                    this.setState({
                        error: error.message,
                    });
                }

                return;
            }

            this.props.history.push('/mfa/confirm');
        });
    };

    public render(): JSX.Element {
        let formClass = 'form-group';
        let errorContent;
        if (this.state.error) {
            errorContent = <div className='form-group has-error'><label className='control-label'>{this.state.error}</label></div>;
            formClass += ' has-error';
        }

        let mfaRequired;
        if (this.props.enforceMultifactorAuthentication) {
            mfaRequired = (
                <p>
                    <FormattedMessage
                        id='mfa.setup.required_mfa'
                        defaultMessage='<strong>Multi-factor authentication is required on {siteName}.</strong>'
                        values={{
                            siteName: this.props.siteName,
                            strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
                        }}
                    />
                </p>
            );
        }

        return (
            <div>
                <form
                    onSubmit={this.submit}
                    className={formClass}
                >
                    {mfaRequired}
                    <p>
                        <FormattedMessage
                            id='mfa.setup.step1'
                            defaultMessage='<strong>Step 1: </strong>On your phone, download Google Authenticator from <linkiTunes>iTunes</linkiTunes> or <linkGooglePlay>Google Play</linkGooglePlay>'
                            values={{
                                strong: (msg: React.ReactNode) => <strong>{msg}</strong>,
                                linkiTunes: (msg: React.ReactNode) => (
                                    <ExternalLink
                                        href='https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8'
                                        location='mfa_setup'
                                    >
                                        {msg}
                                    </ExternalLink>
                                ),
                                linkGooglePlay: (msg: React.ReactNode) => (
                                    <ExternalLink
                                        href='https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en'
                                        location='mfa_setup'
                                    >
                                        {msg}
                                    </ExternalLink>
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='mfa.setup.step2_secret'
                            defaultMessage='<strong>Step 2: </strong>Use Google Authenticator to scan this QR code, or manually type in the secret key.'
                            values={{
                                strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
                            }}
                        />
                    </p>
                    <div className='form-group'>
                        <div className='col-sm-12'>
                            <img
                                alt={'qr code image'}
                                style={style.qrCode}
                                src={'data:image/png;base64,' + this.state.qrCode}
                            />
                        </div>
                    </div>
                    <br/>
                    <div className='form-group'>
                        <p className='col-sm-12'>
                            <FormattedMessage
                                id='mfa.setup.secret'
                                defaultMessage='Secret: {secret}'
                                values={{
                                    secret: this.state.secret,
                                }}
                            />
                        </p>
                    </div>
                    <p>
                        <FormattedMessage
                            id='mfa.setup.step3_code'
                            defaultMessage='<strong>Step 3: </strong>Enter the code generated by Google Authenticator.'
                            values={{
                                strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
                            }}
                        />
                    </p>
                    <p>
                        <LocalizedPlaceholderInput
                            ref={this.input}
                            className='form-control'
                            placeholder={defineMessage({id: 'mfa.setup.code', defaultMessage: 'MFA Code'})}
                            autoFocus={true}
                        />
                    </p>
                    {errorContent}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='mfa.setup.save'
                            defaultMessage='Save'
                        />
                    </button>
                </form>
            </div>
        );
    }
}

const style = {
    qrCode: {maxHeight: 170},
};
