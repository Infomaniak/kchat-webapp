// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import crypto from 'crypto';

import PropTypes from 'prop-types';

import React from 'react';

import {FormattedMessage, injectIntl} from 'react-intl';

import * as GlobalActions from 'actions/global_actions';
import LoadingIk from 'components/loading_ik';
import LoadingScreen from 'components/loading_screen';
import Markdown from 'components/markdown';
import {Client4} from 'mattermost-redux/client';

import LocalStorageStore from 'stores/local_storage_store';
import {browserHistory} from 'utils/browser_history';
import {IKConstants} from 'utils/constants-ik';
import Constants from 'utils/constants';
import {t} from 'utils/i18n.jsx';
import {showNotification} from 'utils/notifications';
import {intlShape} from 'utils/react_intl';
import {isDesktopApp} from 'utils/user_agent';
import * as Utils from 'utils/utils';

// TODO: clean login controller
class LoginController extends React.PureComponent {
    static propTypes = {
        intl: intlShape.isRequired,

        location: PropTypes.object.isRequired,
        isLicensed: PropTypes.bool.isRequired,
        currentUser: PropTypes.object,
        customBrandText: PropTypes.string,
        customDescriptionText: PropTypes.string,
        enableCustomBrand: PropTypes.bool.isRequired,
        enableLdap: PropTypes.bool.isRequired,
        enableSaml: PropTypes.bool.isRequired,
        enableSignInWithEmail: PropTypes.bool.isRequired,
        enableSignInWithUsername: PropTypes.bool.isRequired,
        enableSignUpWithEmail: PropTypes.bool.isRequired,
        enableSignUpWithGitLab: PropTypes.bool.isRequired,
        enableSignUpWithGoogle: PropTypes.bool.isRequired,
        enableSignUpWithOffice365: PropTypes.bool.isRequired,
        enableSignUpWithOpenId: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        ldapLoginFieldName: PropTypes.string,
        siteName: PropTypes.string,
        initializing: PropTypes.bool,
        actions: PropTypes.shape({
            login: PropTypes.func.isRequired,
            addUserToTeamFromInvite: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        let loginId = '';
        if ((new URLSearchParams(this.props.location.search)).get('extra') === Constants.SIGNIN_VERIFIED && (new URLSearchParams(this.props.location.search)).get('email')) {
            loginId = (new URLSearchParams(this.props.location.search)).get('email');
        }

        this.state = {
            ldapEnabled: this.props.isLicensed && this.props.enableLdap,
            usernameSigninEnabled: this.props.enableSignInWithUsername,
            emailSigninEnabled: this.props.enableSignInWithEmail,
            samlEnabled: this.props.isLicensed && this.props.enableSaml,
            loginId,
            password: '',
            showMfa: false,
            loading: false,
            sessionExpired: false,
            brandImageError: false,
        };

        this.loginIdInput = React.createRef();
        this.passwordInput = React.createRef();
    }

    componentDidMount() {
        if (this.props.currentUser) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }
        if (isDesktopApp()) {
            // const loginCode = (new URLSearchParams(this.props.location.search)).get('code')
            const hash = this.props.location.hash;

            const token = localStorage.getItem('IKToken');
            const refreshToken = localStorage.getItem('IKRefreshToken');
            const tokenExpire = localStorage.getItem('IKTokenExpire');

            if (token && tokenExpire && !(tokenExpire <= parseInt(Date.now() / 1000, 10))) {
                Client4.setAuthHeader = true;
                Client4.setToken(token);
                Client4.setCSRF(token);
                LocalStorageStore.setWasLoggedIn(true);
                GlobalActions.redirectUserToDefaultTeam();
            }

            // If need to refresh the token
            // if (tokenExpire && tokenExpire <= Date.now()) {
            //     if (!refreshToken) return

            //     this.setState({loading: true})
            //     Client4.refreshIKLoginToken(
            //         refreshToken,
            //         "https://login.devd281.dev.infomaniak.ch",
            //         "A7376A6D-9A79-4B06-A837-7D92DB93965B"
            //     ).then((resp) => {
            //         return
            //         this.storeTokenResponse(resp)
            //         this.finishSignin();
            //     }).catch((error) => {
            //         console.log(error)
            //         return;
            //     }
            //     ).finally(this.setState({loading: false}))
            //     return;
            // }

            // Receive login code from login redirect
            if (hash) {
                const hash2Obj = {};
                // eslint-disable-next-line array-callback-return
                hash.substring(1).split('&').map((hk) => {
                    const temp = hk.split('=');
                    hash2Obj[temp[0]] = temp[1];
                });
                this.storeTokenResponse(hash2Obj);
                localStorage.removeItem('challenge');
                LocalStorageStore.setWasLoggedIn(true);
                // location.reload();

                this.finishSignin();

                return;

                //     const challenge = JSON.parse(localStorage.getItem('challenge'));
                //     this.setState({ loading: true })
                //     return
                // //    Get token
                //     Client4.getIKLoginToken(
                //         loginCode,
                //         challenge?.challenge,
                //         challenge?.verifier,
                //         "https://login.devd281.dev.infomaniak.ch",
                //         "A7376A6D-9A79-4B06-A837-7D92DB93965B"
                //     ).then((resp) => {
                //         this.storeTokenResponse(resp)
                //         localStorage.removeItem('challenge')
                //         this.finishSignin();
                //     }).catch((error) => {
                //         console.log(error)
                //     }
                //     ).finally(this.setState({ loading: false }))

            //     localStorage.removeItem('challenge');
            //     return
            }

            if (!token || !refreshToken || !tokenExpire || (tokenExpire && tokenExpire <= parseInt(Date.now() / 1000, 10))) {
                // eslint-disable-next-line react/no-did-mount-set-state
                this.setState({loading: true});
                const codeVerifier = this.getCodeVerifier();
                let codeChallenge = '';
                this.generateCodeChallenge(codeVerifier).then((challenge) => {
                    codeChallenge = challenge;

                    // TODO: store in redux instead of localstorage
                    localStorage.setItem('challenge', JSON.stringify({verifier: codeVerifier, challenge: codeChallenge}));

                    // TODO: add env for login url and/or current server
                    window.location.assign(`${IKConstants.LOGIN_URL}authorize?access_type=offline&code_challenge=${codeChallenge}&code_challenge_method=S256&client_id=${IKConstants.CLIENT_ID}&response_type=token&redirect_uri=ktalk://auth-desktop`);
                }).catch(() => {
                    console.log('Error redirect');

                    // Ignore the failure
                // eslint-disable-next-line react/no-did-mount-set-state
                }).finally(this.setState({loading: false}));
            }
        } else {
            const search = new URLSearchParams(this.props.location.search);
            const extra = search.get('extra');
            const email = search.get('email');

            if (extra === Constants.SIGNIN_VERIFIED && email) {
                this.passwordInput.current?.focus();
            }

            // Determine if the user was unexpectedly logged out.
            if (LocalStorageStore.getWasLoggedIn()) {
                if (extra === Constants.SIGNIN_CHANGE) {
                    // Assume that if the user triggered a sign in change, it was intended to logout.
                    // We can't preflight this, since in some flows it's the server that invalidates
                    // our session after we use it to complete the sign in change.
                    LocalStorageStore.setWasLoggedIn(false);
                } else {
                    // Although the authority remains the local sessionExpired bit on the state, set this
                    // extra field in the querystring to signal the desktop app. And although eslint
                    // complains about this, it is allowed: https://reactjs.org/docs/react-component.html#componentdidmount.
                    // eslint-disable-next-line react/no-did-mount-set-state
                    this.setState({sessionExpired: true});
                    search.set('extra', Constants.SESSION_EXPIRED);
                    browserHistory.replace(`${this.props.location.pathname}?${search}`);
                }
            }

            this.showSessionExpiredNotificationIfNeeded();
        }
    }

    componentDidUpdate() {
        this.configureTitle();
        this.showSessionExpiredNotificationIfNeeded();
    }

    componentWillUnmount() {
        if (this.closeSessionExpiredNotification) {
            this.closeSessionExpiredNotification();
            this.closeSessionExpiredNotification = null;
        }
    }

     // Store token infos in localStorage
     storeTokenResponse = (response) => {
         // TODO: store in redux
         const d = new Date();
         d.setSeconds(d.getSeconds() + parseInt(response.expires_in, 10));
         localStorage.setItem('IKToken', response.access_token);
         localStorage.setItem('IKRefreshToken', response.refresh_token);
         localStorage.setItem('IKTokenExpire', parseInt(d.getTime() / 1000, 10));
         Client4.setToken(response.access_token);
         Client4.setCSRF(response.access_token);
         Client4.setAuthHeader = true;
     }

    getCodeVerifier = () => {
        const ramdonByte = crypto.randomBytes(33);
        const hash =
            crypto.createHash('sha256').update(ramdonByte).digest();
        return hash.toString('base64').
            replace(/\+/g, '-').
            replace(/\//g, '_').
            replace(/[=]/g, '');
    }

    generateCodeChallenge = async (codeVerifier) => {
        const hash =
        crypto.createHash('sha256').update(codeVerifier).digest();
        return hash.toString('base64').
            replace(/\+/g, '-').
            replace(/\//g, '_').
            replace(/[=]/g, '');
    }

    configureTitle = () => {
        if (this.state.sessionExpired) {
            document.title = this.props.intl.formatMessage({
                id: 'login.session_expired.title',
                defaultMessage: '* {siteName} - Session Expired',
            }, {
                siteName: this.props.siteName,
            });
        } else {
            document.title = this.props.siteName;
        }
    }

    showSessionExpiredNotificationIfNeeded = () => {
        if (this.state.sessionExpired && !this.closeSessionExpiredNotification) {
            showNotification({
                title: this.props.siteName,
                body: Utils.localizeMessage(
                    'login.session_expired.notification',
                    'Session Expired: Please sign in to continue receiving notifications.',
                ),
                requireInteraction: true,
                silent: false,
                onClick: () => {
                    window.focus();
                    if (this.closeSessionExpiredNotification()) {
                        this.closeSessionExpiredNotification();
                        this.closeSessionExpiredNotification = null;
                    }
                },
            }).then((closeNotification) => {
                this.closeSessionExpiredNotification = closeNotification;
            }).catch(() => {
                // Ignore the failure to display the notification.
            });
        } else if (!this.state.sessionExpired && this.closeSessionExpiredNotification) {
            this.closeSessionExpiredNotification();
            this.closeSessionExpiredNotification = null;
        }
    }

    preSubmit = (e) => {
        e.preventDefault();

        // Discard any session expiry notice once the user interacts with the login page.
        this.onDismissSessionExpired();

        const {location} = this.props;
        const newQuery = location.search.replace(/(extra=password_change)&?/i, '');
        if (newQuery !== location.search) {
            browserHistory.replace(`${location.pathname}${newQuery}${location.hash}`);
        }

        // password managers don't always call onInput handlers for form fields so it's possible
        // for the state to get out of sync with what the user sees in the browser
        let loginId = this.state.loginId;
        if (this.loginIdInput.current) {
            loginId = this.loginIdInput.current.value;
            if (loginId !== this.state.loginId) {
                this.setState({loginId});
            }
        }

        let password = this.state.password;
        if (this.passwordInput.current) {
            password = this.passwordInput.current.value;
            if (password !== this.state.password) {
                this.setState({password});
            }
        }

        // don't trim the password since we support spaces in passwords
        loginId = loginId.trim().toLowerCase();

        if (!loginId) {
            t('login.noEmail');
            t('login.noEmailLdapUsername');
            t('login.noEmailUsername');
            t('login.noEmailUsernameLdapUsername');
            t('login.noLdapUsername');
            t('login.noUsername');
            t('login.noUsernameLdapUsername');

            // it's slightly weird to be constructing the message ID, but it's a bit nicer than triply nested if statements
            let msgId = 'login.no';
            if (this.state.emailSigninEnabled) {
                msgId += 'Email';
            }
            if (this.state.usernameSigninEnabled) {
                msgId += 'Username';
            }
            if (this.state.ldapEnabled) {
                msgId += 'LdapUsername';
            }

            this.setState({
                serverError: (
                    <FormattedMessage
                        id={msgId}
                        values={{
                            ldapUsername: this.props.ldapLoginFieldName || Utils.localizeMessage('login.ldapUsernameLower', 'AD/LDAP username'),
                        }}
                    />
                ),
            });
            return;
        }

        if (!password) {
            this.setState({
                serverError: (
                    <FormattedMessage
                        id='login.noPassword'
                        defaultMessage='Please enter your password'
                    />
                ),
            });
            return;
        }

        this.submit(loginId, password, '');
    }

    submit = (loginId, password, token) => {
        this.setState({serverError: null, loading: true});

        this.props.actions.login(loginId, password, token).then(async ({error}) => {
            if (error) {
                if (error.server_error_id === 'api.user.login.not_verified.app_error') {
                    browserHistory.push('/should_verify_email?&email=' + encodeURIComponent(loginId));
                } else if (error.server_error_id === 'store.sql_user.get_for_login.app_error' ||
                    error.server_error_id === 'ent.ldap.do_login.user_not_registered.app_error') {
                    this.setState({
                        showMfa: false,
                        loading: false,
                        serverError: (
                            <FormattedMessage
                                id='login.userNotFound'
                                defaultMessage="We couldn't find an account matching your login credentials."
                            />
                        ),
                    });
                } else if (error.server_error_id === 'api.user.check_user_password.invalid.app_error' || error.server_error_id === 'ent.ldap.do_login.invalid_password.app_error') {
                    this.setState({
                        showMfa: false,
                        loading: false,
                        serverError: (
                            <FormattedMessage
                                id='login.invalidPassword'
                                defaultMessage='Your password is incorrect.'
                            />
                        ),
                    });
                } else if (!this.state.showMfa && error.server_error_id === 'mfa.validate_token.authenticate.app_error') {
                    this.setState({showMfa: true});
                } else {
                    this.setState({showMfa: false, serverError: error.message, loading: false});
                }

                return;
            }

            // check for query params brought over from signup_user_complete
            const params = new URLSearchParams(this.props.location.search);
            const inviteToken = params.get('t') || '';
            const inviteId = params.get('id') || '';

            if (inviteId || inviteToken) {
                const {data: team} = await this.props.actions.addUserToTeamFromInvite(inviteToken, inviteId);
                if (team) {
                    this.finishSignin(team);
                } else {
                    // there's not really a good way to deal with this, so just let the user log in like normal
                    this.finishSignin();
                }
            } else {
                this.finishSignin();
            }
        });
    }

    finishSignin = (team) => {
        const experimentalPrimaryTeam = this.props.experimentalPrimaryTeam;
        const query = new URLSearchParams(this.props.location.search);
        const redirectTo = query.get('redirect_to');

        Utils.setCSRFFromCookie();

        // Record a successful login to local storage. If an unintentional logout occurs, e.g.
        // via session expiration, this bit won't get reset and we can notify the user as such.
        LocalStorageStore.setWasLoggedIn(true);
        if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
            browserHistory.push(redirectTo);
        } else if (team) {
            browserHistory.push(`/${team.name}`);
        } else if (experimentalPrimaryTeam) {
            browserHistory.push(`/${experimentalPrimaryTeam}`);
        } else {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }

    handleLoginIdChange = (e) => {
        this.setState({
            loginId: e.target.value,
        });
    }

    handlePasswordChange = (e) => {
        this.setState({
            password: e.target.value,
        });
    }

    handleBrandImageError = () => {
        this.setState({brandImageError: true});
    }

    createCustomLogin = () => {
        if (this.props.enableCustomBrand) {
            const text = this.props.customBrandText || '';
            const brandImageUrl = Client4.getBrandImageUrl(0);
            const brandImageStyle = this.state.brandImageError ? {display: 'none'} : {};

            return (
                <div>
                    <img
                        alt={'brand image'}
                        src={brandImageUrl}
                        onError={this.handleBrandImageError}
                        style={brandImageStyle}
                    />
                    <div>
                        <Markdown
                            message={text}
                            options={
                                {mentions: false,
                                    imagesMetadata: null}
                            }
                        />
                    </div>
                </div>
            );
        }

        return null;
    }

    createLoginPlaceholder = () => {
        const ldapEnabled = this.state.ldapEnabled;
        const usernameSigninEnabled = this.state.usernameSigninEnabled;
        const emailSigninEnabled = this.state.emailSigninEnabled;

        const loginPlaceholders = [];
        if (emailSigninEnabled) {
            loginPlaceholders.push(Utils.localizeMessage('login.email', 'Email'));
        }

        if (usernameSigninEnabled) {
            loginPlaceholders.push(Utils.localizeMessage('login.username', 'Username'));
        }

        if (ldapEnabled) {
            if (this.props.ldapLoginFieldName) {
                loginPlaceholders.push(this.props.ldapLoginFieldName);
            } else {
                loginPlaceholders.push(Utils.localizeMessage('login.ldapUsername', 'AD/LDAP Username'));
            }
        }

        if (loginPlaceholders.length >= 2) {
            return loginPlaceholders.slice(0, loginPlaceholders.length - 1).join(', ') +
                Utils.localizeMessage('login.placeholderOr', ' or ') +
                loginPlaceholders[loginPlaceholders.length - 1];
        } else if (loginPlaceholders.length === 1) {
            return loginPlaceholders[0];
        }

        return '';
    }

    checkSignUpEnabled = () => {
        return this.props.enableSignUpWithEmail ||
            this.props.enableSignUpWithGitLab ||
            this.props.enableSignUpWithOffice365 ||
            this.props.enableSignUpWithGoogle ||
            this.props.enableSignUpWithOpenId ||
            this.props.enableLdap ||
            this.props.enableSaml;
    }

    onDismissSessionExpired = () => {
        LocalStorageStore.setWasLoggedIn(false);
        this.setState({sessionExpired: false});
    }

    render() {
        const {
            customDescriptionText,
            siteName,
            initializing,
        } = this.props;

        if (initializing) {
            return (<LoadingScreen/>);
        }

        return (<LoadingIk/>);
    }
}

export default injectIntl(LoginController);
