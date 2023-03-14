// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

export default function ChannelFilesIcon(props: React.HTMLAttributes<HTMLSpanElement>) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width='200'
                height='161'
                viewBox='0 0 270 250'
                fill='none'
                role='img'
                aria-label={formatMessage({id: 'Channel Files Icon', defaultMessage: 'Channel Files Icon'})}
                style={{marginBottom: '20px'}}
            >
                <path
                    className='fill-ik-illustration-grey-16 stroke-ik-illustration-grey-7'
                    strokeWidth='1.539'
                    d='M30.785 157.917h.769v33.222l30.957-32.979.228-.243H167.267a6.235 6.235 0 006.236-6.235V41.005a6.236 6.236 0 00-6.236-6.236H7.732a6.236 6.236 0 00-6.235 6.236v110.677a6.235 6.235 0 006.235 6.235h23.053z'
                />
                <mask
                    id='path-2-inside-1_2056_4868'
                    fill='#fff'
                >
                    <path
                        fillRule='evenodd'
                        d='M158.738 111.636l-12.14 18.882 66.085 42.489a5.612 5.612 0 007.756-1.685l6.07-9.441a5.612 5.612 0 00-1.686-7.755l-66.085-42.49zm58.835 51.172a4.209 4.209 0 10-7.08-4.552 4.209 4.209 0 007.08 4.552z'
                        clipRule='evenodd'
                    />
                </mask>
                <path
                    className='fill-ik-illustration-grey-17'
                    fillRule='evenodd'
                    d='M158.738 111.636l-12.14 18.882 66.085 42.489a5.612 5.612 0 007.756-1.685l6.07-9.441a5.612 5.612 0 00-1.686-7.755l-66.085-42.49zm58.835 51.172a4.209 4.209 0 10-7.08-4.552 4.209 4.209 0 007.08 4.552z'
                    clipRule='evenodd'
                />
                <path
                    className='fill-ik-illustration-grey-7'
                    d='M146.598 130.518l-1.18-.759-.759 1.18 1.18.759.759-1.18zm12.14-18.882l.758-1.18-1.18-.759-.758 1.18 1.18.759zm53.945 61.371l-.759 1.18.759-1.18zm-64.905-41.731l12.14-18.881-2.36-1.518-12.14 18.882 2.36 1.517zm65.664 40.551l-66.086-42.49-1.517 2.361 66.085 42.489 1.518-2.36zm5.817-1.264a4.21 4.21 0 01-5.817 1.264l-1.518 2.36a7.015 7.015 0 009.695-2.106l-2.36-1.518zm6.07-9.441l-6.07 9.441 2.36 1.518 6.07-9.441-2.36-1.518zm-1.265-5.816a4.208 4.208 0 011.265 5.816l2.36 1.518a7.015 7.015 0 00-2.107-9.694l-1.518 2.36zm-66.085-42.49l66.085 42.49 1.518-2.36-66.086-42.49-1.517 2.36zm57.571 45.356a2.806 2.806 0 01.843 3.877l2.36 1.518a5.613 5.613 0 00-1.686-7.756l-1.517 2.361zm-3.878.842a2.807 2.807 0 013.878-.842l1.517-2.361a5.612 5.612 0 00-7.755 1.686l2.36 1.517zm.843 3.878a2.806 2.806 0 01-.843-3.878l-2.36-1.517a5.611 5.611 0 001.685 7.755l1.518-2.36zm3.878-.843a2.806 2.806 0 01-3.878.843l-1.518 2.36a5.613 5.613 0 007.756-1.685l-2.36-1.518z'
                    mask='url(#path-2-inside-1_2056_4868)'
                />
                <circle
                    cx='111.003'
                    cy='95.003'
                    r='68.044'
                    className='fill-ik-illustration-grey-17 stroke-ik-illustration-grey-7'
                    strokeWidth='1.403'
                    transform='rotate(-57.261 111.003 95.003)'
                />
                <circle
                    cx='111.128'
                    cy='94.977'
                    r='51.298'
                    className='fill-ik-illustration-grey-2 stroke-ik-illustration-grey-7'
                    strokeWidth='1.403'
                    transform='rotate(-57.261 111.128 94.977)'
                />
                <path
                    fill='#0088B2'
                    fillRule='evenodd'
                    d='M121.016 67.679l12.633 12.633c.438.437.684 1.03.684 1.65v36.371a4.667 4.667 0 01-4.667 4.667H92.333a4.667 4.667 0 01-4.667-4.667V71.667A4.667 4.667 0 0192.333 67h27.034a2.332 2.332 0 011.649.679zm7.483 50.654c.645 0 1.167-.522 1.167-1.166v-33.25a.583.583 0 00-.583-.584h-6.417a4.667 4.667 0 01-4.667-4.666V72.25a.583.583 0 00-.583-.583H93.499c-.644 0-1.166.522-1.166 1.166v44.334c0 .644.522 1.166 1.166 1.166h35zm-30.333-25.67c0-.645.523-1.168 1.167-1.168H104c.644 0 1.166.523 1.166 1.167v2.333c0 .645-.522 1.167-1.166 1.167h-4.667a1.167 1.167 0 01-1.167-1.167v-2.333zm1.167 7c-.644 0-1.167.521-1.167 1.166v2.333c0 .644.523 1.167 1.167 1.167H104c.644 0 1.166-.523 1.166-1.167v-2.333c0-.645-.522-1.167-1.166-1.167h-4.667zm-1.167 9.332c0-.644.523-1.166 1.167-1.166H104c.644 0 1.166.522 1.166 1.166v2.334c0 .644-.522 1.166-1.166 1.166h-4.667a1.166 1.166 0 01-1.167-1.166v-2.334zm11.667-17.5c-.644 0-1.167.523-1.167 1.167v2.333c0 .645.523 1.167 1.167 1.167h12.833c.645 0 1.167-.522 1.167-1.167v-2.333c0-.644-.522-1.167-1.167-1.167h-12.833zm-1.167 9.334c0-.645.523-1.167 1.167-1.167h12.833c.645 0 1.167.522 1.167 1.167v2.333c0 .644-.522 1.167-1.167 1.167h-12.833a1.168 1.168 0 01-1.167-1.167v-2.333zm1.167 7c-.644 0-1.167.522-1.167 1.166v2.334c0 .644.523 1.166 1.167 1.166h12.833c.645 0 1.167-.522 1.167-1.166v-2.334c0-.644-.522-1.166-1.167-1.166h-12.833z'
                    clipRule='evenodd'
                />
                <mask
                    style={{maskType: 'luminance'}}
                    width='48'
                    height='56'
                    x='87'
                    y='67'
                    maskUnits='userSpaceOnUse'
                >
                    <path
                        fill='#fff'
                        fillRule='evenodd'
                        d='M121.016 67.679l12.633 12.633c.438.437.684 1.03.684 1.65v36.371a4.667 4.667 0 01-4.667 4.667H92.333a4.667 4.667 0 01-4.667-4.667V71.667A4.667 4.667 0 0192.333 67h27.034a2.332 2.332 0 011.649.679zm7.483 50.654c.645 0 1.167-.522 1.167-1.166v-33.25a.583.583 0 00-.583-.584h-6.417a4.667 4.667 0 01-4.667-4.666V72.25a.583.583 0 00-.583-.583H93.499c-.644 0-1.166.522-1.166 1.166v44.334c0 .644.522 1.166 1.166 1.166h35zm-30.333-25.67c0-.645.523-1.168 1.167-1.168H104c.644 0 1.166.523 1.166 1.167v2.333c0 .645-.522 1.167-1.166 1.167h-4.667a1.167 1.167 0 01-1.167-1.167v-2.333zm1.167 7c-.644 0-1.167.521-1.167 1.166v2.333c0 .644.523 1.167 1.167 1.167H104c.644 0 1.166-.523 1.166-1.167v-2.333c0-.645-.522-1.167-1.166-1.167h-4.667zm-1.167 9.332c0-.644.523-1.166 1.167-1.166H104c.644 0 1.166.522 1.166 1.166v2.334c0 .644-.522 1.166-1.166 1.166h-4.667a1.166 1.166 0 01-1.167-1.166v-2.334zm11.667-17.5c-.644 0-1.167.523-1.167 1.167v2.333c0 .645.523 1.167 1.167 1.167h12.833c.645 0 1.167-.522 1.167-1.167v-2.333c0-.644-.522-1.167-1.167-1.167h-12.833zm-1.167 9.334c0-.645.523-1.167 1.167-1.167h12.833c.645 0 1.167.522 1.167 1.167v2.333c0 .644-.522 1.167-1.167 1.167h-12.833a1.168 1.168 0 01-1.167-1.167v-2.333zm1.167 7c-.644 0-1.167.522-1.167 1.166v2.334c0 .644.523 1.166 1.167 1.166h12.833c.645 0 1.167-.522 1.167-1.166v-2.334c0-.644-.522-1.166-1.167-1.166h-12.833z'
                        clipRule='evenodd'
                    />
                </mask>
                <path
                    className='fill-ik-illustration-grey-16'
                    d='M126.433 241.695c65.409 0 118.433-6.2 118.433-13.848 0-7.647-53.024-13.847-118.433-13.847S8 220.2 8 227.847c0 7.648 53.024 13.848 118.433 13.848z'
                />
            </svg>
        </span>
    );
}