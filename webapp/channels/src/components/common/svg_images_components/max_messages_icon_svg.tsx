// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */
import React from 'react';

type SvgProps = {
    width?: number;
    height?: number;
}

const MaxMessagesIconSvg = (props: SvgProps) => (
    <svg
        width={props.width?.toString() || '40'}
        height={props.height?.toString() || '40'}
        viewBox='0 0 40 40'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M24.6563 1.18164H37.7241C38.9811 1.18164 40 2.20058 40 3.4575V11.5649C40 12.8218 38.9811 13.8408 37.7241 13.8408H35.9366L32.6585 17.3329V13.8408H24.6563C23.3994 13.8408 22.3804 12.8218 22.3804 11.5649V3.4575C22.3804 2.20058 23.3994 1.18164 24.6563 1.18164Z'
            fill='#0088B2'
        />
        <path
            d='M18.8204 28.5944L18.7472 28.5215H18.644H2.27586C1.15701 28.5215 0.25 27.6145 0.25 26.4957V10.3325C0.25 9.21365 1.15701 8.30664 2.27586 8.30664H28.5584C29.6772 8.30664 30.5843 9.21365 30.5843 10.3325V26.4957C30.5843 27.6145 29.6772 28.5215 28.5584 28.5215H24.3806H24.1306V28.7715V33.8841L18.8204 28.5944Z'
            fill='#FAFAFA'
            stroke='#E0E0E0'
            strokeWidth='0.5'
        />
        <rect
            x='3.58569'
            y='13.7734'
            width='22.9464'
            height='2.85723'
            rx='1.42861'
            fill='#D9D9D9'
        />
        <rect
            x='3.58569'
            y='19.4863'
            width='17.2098'
            height='2.85723'
            rx='1.42861'
            fill='#D9D9D9'
        />
        <path
            d='M19.9999 38.8178C31.0142 38.8178 39.943 37.7739 39.943 36.4861C39.943 35.1983 31.0142 34.1543 19.9999 34.1543C8.98569 34.1543 0.0568848 35.1983 0.0568848 36.4861C0.0568848 37.7739 8.98569 38.8178 19.9999 38.8178Z'
            fill='white'
        />
    </svg>
);

export default MaxMessagesIconSvg;
