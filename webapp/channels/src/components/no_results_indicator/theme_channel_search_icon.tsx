import type {HTMLAttributes} from 'react';
import React from 'react';
import {useSelector} from 'react-redux';

import type {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {InfomaniakChannelSearchLightSvg, InfomaniakChannelSearchDarkSvg} from 'components/common/svg_images_components';

const ThemedChannelSearchIcon = (props: HTMLAttributes<HTMLSpanElement>) => {
    const theme: Theme = useSelector(getTheme);

    const isDarkTheme = theme.ksuiteTheme === 'light';

    return isDarkTheme ? (
        <InfomaniakChannelSearchLightSvg {...props}/>
    ) : (
        <InfomaniakChannelSearchDarkSvg {...props}/>
    );
};

export default ThemedChannelSearchIcon;
