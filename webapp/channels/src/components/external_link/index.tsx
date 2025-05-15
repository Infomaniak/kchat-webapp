// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {forwardRef} from 'react';

import {trackEvent} from 'actions/telemetry_actions';

import type {ExternalLinkQueryParams} from 'components/common/hooks/use_external_link';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    target?: string;
    rel?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    queryParams?: ExternalLinkQueryParams;
    children: React.ReactNode;
}

const ExternalLink = forwardRef<HTMLAnchorElement, Props>((props, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        trackEvent('link_out', 'click_external_link');
        if (typeof props.onClick === 'function') {
            props.onClick(e);
        }
    };

    return (
        <a
            {...props}
            ref={ref}
            target={props.target || '_blank'}
            rel={props.rel || 'noopener noreferrer'}
            onClick={handleClick}
            href={props.href}
        >
            {props.children}
        </a>
    );
});

export default ExternalLink;
