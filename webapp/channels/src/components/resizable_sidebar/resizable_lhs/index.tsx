// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {HTMLAttributes} from 'react';
import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {DEFAULT_LHS_WIDTH, CssVarKeyForResizable, ResizeDirection} from '../constants';
import ResizableDivider from '../resizable_divider';

interface Props extends HTMLAttributes<'div'> {
    children: React.ReactNode;
}

function ResizableLhs({
    children,
    id,
    className,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const {ikType} = useSelector(getTheme);
    useEffect(() => {
        const sidebar: HTMLElement | null = document.getElementById('SidebarContainer');
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const newWidth = entry.contentRect.width;
                const [element] = document.querySelectorAll('[class^="LeftControlsContainer"]');
                (element as any).style.width = `${newWidth + ((ikType === 'medium') ? 1 : 0)}px`;
            });
        });
        sidebar && resizeObserver.observe(sidebar);
    }, [ikType]);

    return (
        <div
            id={id}
            className={className}
            ref={containerRef}
        >
            {children}
            <ResizableDivider
                name={'lhsResizeHandle'}
                globalCssVar={CssVarKeyForResizable.LHS}
                defaultWidth={DEFAULT_LHS_WIDTH}
                dir={ResizeDirection.LEFT}
                containerRef={containerRef}
            />
        </div>
    );
}

export default ResizableLhs;
