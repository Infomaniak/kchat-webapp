// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as GlobalActions from 'actions/global_actions';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import LoadingIk from 'components/loading_ik';
import LoadingScreen from 'components/loading_screen';
import crypto from 'crypto';
import logoImage from 'images/logo.png';
import { Client4 } from 'mattermost-redux/client';
import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import LocalStorageStore from 'stores/local_storage_store';
import { browserHistory } from 'utils/browser_history';
import { IKConstants } from 'utils/constants-ik';
import { intlShape } from 'utils/react_intl';
import * as Utils from 'utils/utils.jsx';

class LoginDesktopController extends React.PureComponent {
    static propTypes = {
        intl: intlShape.isRequired,
        location: PropTypes.object.isRequired,
        currentUser: PropTypes.object,
        siteName: PropTypes.string,
        actions: PropTypes.shape({
            loadTokens: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            sessionExpired: false,
        };

    }

    componentDidMount() {

        if (this.props.currentUser) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }
        // const loginCode = (new URLSearchParams(this.props.location.search)).get('code')
        const hash = this.props.location.hash

        const token = localStorage.getItem('IKToken');
        const refreshToken = localStorage.getItem('IKRefreshToken');
        const tokenExpire = localStorage.getItem('IKTokenExpire');

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
            const hash2Obj = {}
            hash.substring(1).split("&").map(hk => {
                let temp = hk.split('=');
                hash2Obj[temp[0]] = temp[1]
              });
            this.storeTokenResponse(hash2Obj)
            localStorage.removeItem('challenge')
            LocalStorageStore.setWasLoggedIn(true);
            location.reload();

            return
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

        if (!token || !refreshToken || !tokenExpire || (tokenExpire && tokenExpire <= Date.now())) {
            this.setState({ loading: true });
            const codeVerifier = this.getCodeVerifier()
            let codeChallenge = ""
            this.generateCodeChallenge(codeVerifier).then(challenge => {
                codeChallenge = challenge;
                // TODO: store in redux instead of localstorage
                localStorage.setItem('challenge', JSON.stringify({ verifier: codeVerifier, challenge: codeChallenge }));
                // TODO: add env for login url and/or current server
                window.location.replace(`${IKConstants.LOGIN_URL}/authorize?client_id=${IKConstants.CLIENT_ID}&response_type=token&access_type=offline&code_challenge=${codeChallenge}&code_challenge_method=S256`)
            }).finally(this.setState({loading: false}));
        }
    }

    componentDidUpdate() {
        //
    }

    componentWillUnmount() {
        //
    }

    // Store token infos in localStorage
    storeTokenResponse = (response) => {
        // TODO: store in redux
        localStorage.setItem("IKToken", response.access_token);
        localStorage.setItem("IKRefreshToken", response.refresh_token);
        localStorage.setItem("IKTokenExpire", parseInt(Date.now()) + parseInt(response.expires_in));
        Client4.setToken(response.access_token);
        Client4.setCSRF(response.access_token)
        Client4.setAuthHeader = true;
    }

    getCodeVerifier = () => {
        const ramdonByte = crypto.randomBytes(33);
        const hash =
            crypto.createHash('sha256').update(ramdonByte).digest();
        return hash.toString('base64')
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
    }

    generateCodeChallenge = async (codeVerifier) => {
        const hash =
        crypto.createHash('sha256').update(codeVerifier).digest()
        return hash.toString('base64')
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=/g, "");
    }

    // Do not clear this
    finishSignin = (team) => {
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
        } else {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }

    render() {
        return (<LoadingIk />);
    }
}

export default injectIntl(LoginDesktopController);
