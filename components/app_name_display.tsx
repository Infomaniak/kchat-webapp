// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, CSSProperties} from 'react';

import loaderkChat from 'images/logo_compact.png';

import './app_name_display.scss';
import {isDesktopApp} from 'utils/user_agent';
type Props = {
    position: 'absolute' | 'fixed' | 'relative' | 'static' | 'inherit';
    style?: CSSProperties;
    message?: ReactNode;
}

export default class AppNameDisplay extends React.PureComponent<Props> {
    public constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public render(): JSX.Element {
        const app = this.state.app;
        let appName;
        if (app) {
            appName = app.name;
        } else {
            appName = 'kChat';
        }

        let icon;
        if (app && app.icon_url) {
            icon = app.icon_url;
        } else {
            icon = loaderkChat;
        }
        return (
            <div
                className='app-name'
            >

                <img
                    className='app-name__logo'
                    src={icon}
                    alt='kchat logo'
                />
                {!isDesktopApp() && (
                    <span className='app-name__title'>
                        {appName}
                    </span>
                )}
            </div>
        );
    }
}
