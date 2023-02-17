// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import MattermostLogoSvg from 'images/logo.svg';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon';
import BrowserStore from 'stores/browser_store';
import {LandingPreferenceTypes} from 'utils/constants';
import * as Utils from 'utils/utils';

import * as UserAgent from 'utils/user_agent';

import loaderkChat from '../../images/logo_compact.png';

import svgDesktop from '../../images/desktop.svg';
import svgWeb from '../../images/web.svg';

type Props = {
    defaultTheme: any;
    desktopAppLink?: string;
    iosAppLink?: string;
    androidAppLink?: string;
    siteUrl?: string;
    siteName?: string;
    brandImageUrl?: string;
    enableCustomBrand: boolean;
}

type State = {
    rememberChecked: boolean;
    redirectPage: boolean;
    location: string;
    nativeLocation: string;
    brandImageError: boolean;
    navigating: boolean;
}

export default class LinkingLandingPage extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const location = window.location.href.replace('/landing#', '');

        this.state = {
            rememberChecked: true,
            redirectPage: false,
            location,
            nativeLocation: location.replace(/^(https|http)/, 'kchat'),
            brandImageError: false,
            navigating: false,
        };

        if (!BrowserStore.hasSeenLandingPage()) {
            BrowserStore.setLandingPageSeen(true);
        }
    }

    componentDidMount() {
        Utils.applyTheme(this.props.defaultTheme);
        if (this.checkLandingPreferenceApp()) {
            this.openMattermostApp();
        }

        window.addEventListener('beforeunload', this.clearLandingPreferenceIfNotChecked);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.clearLandingPreferenceIfNotChecked);
    }

    clearLandingPreferenceIfNotChecked = () => {
        if (!this.state.navigating && !this.state.rememberChecked) {
            BrowserStore.clearLandingPreference(this.props.siteUrl);
        }
    }

    checkLandingPreferenceBrowser = () => {
        const landingPreference = BrowserStore.getLandingPreference(this.props.siteUrl);
        return landingPreference && landingPreference === LandingPreferenceTypes.BROWSER;
    }

    checkLandingPreferenceApp = () => {
        const landingPreference = BrowserStore.getLandingPreference(this.props.siteUrl);
        return landingPreference && landingPreference === LandingPreferenceTypes.MATTERMOSTAPP;
    }

    setPreference = (pref: string, clearIfNotChecked?: boolean) => {
        if (!this.state.rememberChecked) {
            if (clearIfNotChecked) {
                BrowserStore.clearLandingPreference(this.props.siteUrl);
            }
            return;
        }

        switch (pref) {
        case LandingPreferenceTypes.MATTERMOSTAPP:
            BrowserStore.setLandingPreferenceToMattermostApp(this.props.siteUrl);
            break;
        case LandingPreferenceTypes.BROWSER:
            BrowserStore.setLandingPreferenceToBrowser(this.props.siteUrl);
            break;
        default:
            break;
        }
    }

    openMattermostApp = () => {
        this.setPreference(LandingPreferenceTypes.MATTERMOSTAPP);
        this.setState({redirectPage: true});
        window.location.href = this.state.nativeLocation;
    }

    openInBrowser = () => {
        this.setPreference(LandingPreferenceTypes.BROWSER);
        window.location.href = this.state.location;
    }

    renderGoNativeAppMessage = () => {
        return (
            <a
                className='get-app__align-btn btn btn-primary btn-lg get-app__download'
                href={this.state.nativeLocation}
                onMouseDown={() => {
                    this.setPreference(LandingPreferenceTypes.MATTERMOSTAPP, true);
                }}
                onClick={() => {
                    this.setPreference(LandingPreferenceTypes.MATTERMOSTAPP, true);
                    this.setState({redirectPage: true, navigating: true});
                }}
            >
                <img
                    src={svgDesktop}
                    alt='img desktop'
                />
                <FormattedMessage
                    id='get_app.systemDialogMessage'
                    tagName='p'
                    defaultMessage='From the application'
                />
            </a>
        );
    }

    getDownloadLink = () => {
        if (UserAgent.isIosWeb()) {
            return this.props.iosAppLink;
        } else if (UserAgent.isAndroidWeb()) {
            return this.props.androidAppLink;
        }
        let desktopAppLink = '';
        fetch('https://www.infomaniak.com/kchat/latest').then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.statusText)))).then((data) => {
            if (UserAgent.isMac()) {
                desktopAppLink = 'https://infomaniak.com/gtl/apps.kchat';
            } else if (UserAgent.isWindows()) {
                desktopAppLink = data.win32.downloadurl;
            } else if (UserAgent.isLinux()) {
                desktopAppLink = data.linux.downloadurl;
            }
            console.log(data, desktopAppLink)
        });

        return desktopAppLink;
    }

    renderDownloadLinkText = () => {
        const isMobile = UserAgent.isMobile();

        if (isMobile) {
            return (
                <FormattedMessage
                    id='get_app.dontHaveTheMobileApp'
                    tagName='p'
                    defaultMessage={'Don\'t have the Mobile App?'}
                />
            );
        }

        return (
            <FormattedMessage
                id='get_app.dontHaveTheDesktopApp'
                tagName='p'
                defaultMessage={'Don\'t have the Desktop App?'}
            />
        );
    }

    renderDownloadLinkSection = () => {
        const downloadLink = this.getDownloadLink();
            console.log(downloadLink)
        if (downloadLink) {
            return (
                <div className='get-app__download-link'>
                    {this.renderDownloadLinkText()}
                    <a href={downloadLink}>
                        <FormattedMessage
                            id='get_app.downloadTheAppNow'
                            tagName='p'
                            defaultMessage='Download the app'
                        />
                    </a>
                </div>
            );
        }

        return null;
    }

    renderDialogHeader = () => {
        const downloadLink = this.getDownloadLink();

        let openingLink = (
            <FormattedMessage
                id='get_app.openingLink'
                defaultMessage='Opening link in Mattermost...'
            />
        );
        if (this.props.enableCustomBrand) {
            openingLink = (
                <FormattedMessage
                    id='get_app.openingLinkWhiteLabel'
                    defaultMessage='Opening link in {appName}...'
                    values={{
                        appName: this.props.siteName || 'Mattermost',
                    }}
                />
            );
        }

        if (this.state.redirectPage) {
            return (
                <h1 className='get-app__launching'>
                    {openingLink}
                    <div className={`get-app__alternative${this.state.redirectPage ? ' redirect-page' : ''}`}>
                        <FormattedMessage
                            id='get_app.redirectedInMoments'
                            defaultMessage='You will be redirected in a few moments.'
                        />
                        <br/>
                        {this.renderDownloadLinkText()}
                        {'\u00A0'}
                        <br className='mobile-only'/>
                        <a href={downloadLink}>
                            <FormattedMessage
                                id='get_app.downloadTheAppNow'
                                defaultMessage='Download the app now.'
                            />
                        </a>
                    </div>
                </h1>
            );
        }

        return (
            <div className='get-app__launching'>
                <div className='get-app__launching--header'>
                    <img
                        className='get-app__launching--logo'
                        src={loaderkChat}
                        alt='kchat logo'
                    />
                    <h1>kChat</h1>
                </div>
                <div className='get-app__alternative'>
                    <FormattedMessage
                        id='get_app.howJoinkChat'
                        tagName='p'
                        defaultMessage='How do you want to join the chat? '
                    />
                </div>
            </div>
        );
    }

    renderDialogBody = () => {
        if (this.state.redirectPage) {
            return (
                <div className='get-app__dialog-body'>
                    {this.renderDialogHeader()}
                    <div className='get-app__hr'/>
                    {this.renderDownloadLinkSection()}
                </div>
            );
        }

        return (
            <div className='get-app__dialog-body'>
                {this.renderDialogHeader()}
                <div className='get-app__buttons'>
                    <div className='get-app__status'>
                        <a
                            href={this.state.location}
                            onMouseDown={() => {
                                this.setPreference(LandingPreferenceTypes.BROWSER, true);
                            }}
                            onClick={() => {
                                this.setPreference(LandingPreferenceTypes.BROWSER, true);
                                this.setState({navigating: true});
                            }}
                            className='btn btn-default btn-lg get-app__continue get-app__align-btn '
                        >
                            <img
                                src={svgWeb}
                                alt='img desktop'
                            />
                            <FormattedMessage
                                id='get_app.continueToBrowser'
                                tagName='p'
                                defaultMessage='From the Browser'
                            />
                        </a>
                    </div>
                    <div className='get-app__status'>
                        {this.renderGoNativeAppMessage()}
                    </div>

                </div>
                <div className='get-app__hr'/>
                {this.renderDownloadLinkSection()}
            </div>
        );
    }

    renderHeader = () => {
        const header = (
            <div className='get-app__header'>
                <img
                    className='get-app__logo'
                    src={loaderkChat}
                    alt='kchat logo'
                />
                <div className='get-app__title'>
                    <img
                        className='get-app__ik-logo'
                        src={MattermostLogoSvg}
                        alt='infomaniak logo'
                    />
                    {'kChat'}
                </div>
            </div>
        );

        return header;
    }

    render() {
        const isMobile = UserAgent.isMobile();

        if (this.checkLandingPreferenceBrowser()) {
            this.openInBrowser();
            return null;
        }

        return (
            <div className='get-app'>
                {this.renderHeader()}
                <div className='get-app__dialog-container'>
                    <div className='get-app__dialog'>

                        {this.renderDialogBody()}

                    </div>

                    <p className='get-app__footer'>
                        <a
                            href='https://www.infomaniak.com/gtl/rgpd.documents'
                        >GT&amp;C</a>
                        - En savoir plus sur <a
                            href='https://www.infomaniak.com/'
                        >Infomaniak</a></p>
                </div>
            </div>
        );
    }
}
