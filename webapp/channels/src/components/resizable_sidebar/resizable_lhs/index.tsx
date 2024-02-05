// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {HTMLAttributes} from 'react';
import React, {useRef} from 'react';

import {DEFAULT_LHS_WIDTH, CssVarKeyForResizable, ResizeDirection} from '../constants';
import ResizableDivider from '../resizable_divider';

interface Props extends HTMLAttributes<'div'> {
    children: React.ReactNode;
    headerRef: React.RefObject<HTMLDivElement>;
}

function ResizableLhs({
    children,
    id,
    className,
    headerRef,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            id={id}
            className={className}
            ref={containerRef}
        >
            {children}
            <ResizableDivider
                name={'lhsResizeHandle'}
                headerRef={headerRef}
                globalCssVar={CssVarKeyForResizable.LHS}
                defaultWidth={DEFAULT_LHS_WIDTH}
                dir={ResizeDirection.LEFT}
                containerRef={containerRef}
            />
        </div>
    );
}

export default ResizableLhs;
