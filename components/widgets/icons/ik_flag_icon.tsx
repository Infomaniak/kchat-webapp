// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {GlobalState} from 'types/store';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

export default function IKFlagIcon(props: React.HTMLAttributes<HTMLSpanElement>) {
    const {formatMessage} = useIntl();
    const theme = useSelector((state: GlobalState) => getTheme(state));
    let themeColors = ['#F1F1F1', '#FAFAFA', '#0088B2', '#FFFFFF', '#E0E0E0'];
    if (theme.ikType === 'dark') {
        themeColors = ['#7C7C7C', '#282828', '#0088B2', '#EAEAEA', '#4C4C4C'];
    }
    return (
        <span {...props}>
            <svg
                width='155'
                height='125'
                viewBox='0 0 309 250'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-label={formatMessage({id: 'generic_icons.flag', defaultMessage: 'Flag Icon'})}
                style={{marginBottom: '20px'}}
            >
                <path
                    d='M252.569 96.374H253.167V96.9725V122.211L277.243 96.5629L277.42 96.374H277.68H303.359C306.037 96.374 308.208 94.2028 308.208 91.5244V5.44806C308.208 2.7697 306.037 0.598461 303.359 0.598461H179.283C176.605 0.598461 174.434 2.7697 174.434 5.44806V91.5244C174.434 94.2028 176.605 96.374 179.283 96.374H252.569Z'
                    fill={themeColors[0]}
                    stroke={themeColors[4]}
                    strokeWidth='1.19692'
                />
                <path
                    d='M153.208 250C237.58 250 305.978 242.003 305.978 232.138C305.978 222.273 237.58 214.276 153.208 214.276C68.8354 214.276 0.437988 222.273 0.437988 232.138C0.437988 242.003 68.8354 250 153.208 250Z'
                    fill={themeColors[1]}
                />
                <path
                    d='M186.763 182.012H186.164V182.611V224.944L143.241 182.187L143.066 182.012H142.819H5.44807C2.76971 182.012 0.598461 179.841 0.598461 177.163V29.3768C0.598461 26.6984 2.7697 24.5272 5.44806 24.5272H230.752C233.43 24.5272 235.601 26.6984 235.601 29.3768V177.163C235.601 179.841 233.43 182.012 230.752 182.012H186.763Z'
                    fill={themeColors[1]}
                    stroke={themeColors[4]}
                    strokeWidth='1.19692'
                />
                <ellipse
                    cx='118.673'
                    cy='100.614'
                    rx='36.1179'
                    ry='36.1179'
                    fill={themeColors[2]}
                />
                <path
                    d='M107.064 88.7244C107.064 88.1668 107.514 87.7148 108.071 87.7148C109.704 87.7148 113.298 87.7148 118.673 87.7148C124.048 87.7148 127.642 87.7148 129.275 87.7148C129.833 87.7148 130.283 88.1668 130.283 88.7244V115.519C130.283 116.321 129.393 116.803 128.722 116.365L119.225 110.171C118.89 109.953 118.457 109.953 118.122 110.171L108.625 116.365C107.953 116.803 107.064 116.321 107.064 115.519V88.7244Z'
                    fill={themeColors[3]}
                />
            </svg>
        </span>
    );
}
