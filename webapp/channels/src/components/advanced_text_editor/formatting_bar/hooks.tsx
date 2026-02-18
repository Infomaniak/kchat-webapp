// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Instance} from '@popperjs/core';
import debounce from 'lodash/debounce';
import type React from 'react';
import {useEffect, useLayoutEffect, useMemo, useState} from 'react';

import type {MarkdownMode} from 'utils/markdown/apply_markdown';

type WideMode = 'wide' | 'normal' | 'narrow' | 'small' | 'min';

const useResponsiveFormattingBar = (ref: React.RefObject<HTMLDivElement>): WideMode => {
    const [wideMode, setWideMode] = useState<WideMode>('wide');
    const handleResize = useMemo(() => debounce(() => {
        if (ref.current?.clientWidth == null) {
            return;
        }
        if (ref.current?.clientWidth > 688) {
            setWideMode('wide');
        }
        if (ref.current?.clientWidth >= 518 && ref.current?.clientWidth <= 688) {
            setWideMode('normal');
        }
        if (ref.current?.clientWidth >= 454 && ref.current?.clientWidth < 518) {
            setWideMode('narrow');
        }

        if (ref.current?.clientWidth >= 422 && ref.current?.clientWidth < 454) {
            setWideMode('small');
        }

        if (ref.current?.clientWidth < 422) {
            setWideMode('min');
        }
    }, 10), [ref]);

    useLayoutEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        let sizeObserver: ResizeObserver | null = new ResizeObserver(handleResize);

        sizeObserver.observe(ref.current);

        return () => {
            sizeObserver!.disconnect();
            sizeObserver = null;
        };
    }, [handleResize, ref]);

    return wideMode;
};

const MAP_WIDE_MODE_TO_CONTROLS_QUANTITY: {[key in WideMode]: number} = {
    wide: 9,
    normal: 5,
    narrow: 3,
    small: 2,
    min: 1,
};

export function splitFormattingBarControls(wideMode: WideMode) {
    const allControls: MarkdownMode[] = ['bold', 'italic', 'strike', 'heading', 'link', 'code', 'quote', 'ul', 'ol'];

    const controlsLength = MAP_WIDE_MODE_TO_CONTROLS_QUANTITY[wideMode];

    const controls = allControls.slice(0, controlsLength);
    const hiddenControls = allControls.slice(controlsLength);

    return {
        controls,
        hiddenControls,
    };
}

export const useFormattingBarControls = (
    formattingBarRef: React.RefObject<HTMLDivElement>,
): {
    controls: MarkdownMode[];
    hiddenControls: MarkdownMode[];
    wideMode: WideMode;
} => {
    const wideMode = useResponsiveFormattingBar(formattingBarRef);

    const {controls, hiddenControls} = splitFormattingBarControls(wideMode);

    return {
        controls,
        hiddenControls,
        wideMode,
    };
};

export const useUpdateOnVisibilityChange = (update: Instance['update'] | null, isVisible: boolean) => {
    const updateComponent = async () => {
        if (!update) {
            return;
        }
        await update();
    };

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        updateComponent();
    }, [isVisible]);
};
