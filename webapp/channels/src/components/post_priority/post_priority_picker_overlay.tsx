// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    FloatingFocusManager,
    FloatingPortal,
    autoUpdate,
    offset,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
    flip,
    shift,
} from '@floating-ui/react';
import classNames from 'classnames';
import React, {memo, useCallback, useState} from 'react';
import {useIntl} from 'react-intl';

import {AlertCircleOutlineIcon} from '@infomaniak/compass-icons/components';
import type {PostPriorityMetadata} from '@mattermost/types/posts';

import {IconContainer} from 'components/advanced_text_editor/formatting_bar/formatting_icon';
import useTooltip from 'components/common/hooks/useTooltip';

import PostPriorityPicker from './post_priority_picker';

type Props = {
    disabled: boolean;
    settings?: PostPriorityMetadata;
    onApply: (props: PostPriorityMetadata) => void;
    onClose: () => void;
};

function PostPriorityPickerOverlay({
    disabled,
    settings,
    onApply,
    onClose,
}: Props) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const {formatMessage} = useIntl();

    const messagePriority = formatMessage({id: 'shortcuts.msgs.formatting_bar.post_priority', defaultMessage: 'Message priority'});
    const {
        setReference: setTooltipRef,
        getReferenceProps: getTooltipReferenceProps,
        tooltip,
    } = useTooltip({
        placement: 'top',
        message: messagePriority,
    });

    const handleClose = useCallback(() => {
        setPickerOpen(false);
        onClose();
    }, [onClose]);

    const {
        x: pickerX,
        y: pickerY,
        strategy: pickerStrategy,
        context: pickerContext,
        refs: {
            setReference: setPickerReference,
            setFloating: setPickerFloating,
        },
    } = useFloating({
        open: pickerOpen,
        onOpenChange: setPickerOpen,
        placement: 'top-start',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset({mainAxis: 4}),
            flip({
                fallbackPlacements: ['top', 'bottom-start'],
            }),
            shift({
                padding: 16,
            }),
        ],
    });

    const {
        getFloatingProps: getPickerFloatingProps,
        getReferenceProps: getPickerReferenceProps,
    } = useInteractions([
        useClick(pickerContext),
        useDismiss(pickerContext),
        useRole(pickerContext),
    ]);

    return (
        <>
            <div
                ref={setTooltipRef}
                {...getTooltipReferenceProps()}
            >
                <IconContainer
                    id='messagePriority'
                    ref={setPickerReference}
                    className={classNames({control: true, active: pickerOpen})}
                    disabled={disabled}
                    type='button'
                    aria-label={messagePriority}
                    {...getPickerReferenceProps()}
                >
                    <AlertCircleOutlineIcon
                        size={18}
                        color='currentColor'
                    />
                </IconContainer>
            </div>
            <FloatingPortal id='root-portal'>
                {pickerOpen && (
                    <FloatingFocusManager
                        context={pickerContext}
                        modal={true}
                        returnFocus={false}
                        initialFocus={-1}
                    >
                        <div
                            ref={setPickerFloating}
                            style={{
                                width: 'max-content',
                                position: pickerStrategy,
                                top: pickerY ?? 0,
                                left: pickerX ?? 0,
                                zIndex: 3,
                            }}
                            {...getPickerFloatingProps()}
                        >
                            <PostPriorityPicker
                                settings={settings}
                                onApply={onApply}
                                onClose={handleClose}
                            />
                        </div>
                    </FloatingFocusManager>
                )}
            </FloatingPortal>
            {!pickerOpen && tooltip}
        </>
    );
}

export default memo(PostPriorityPickerOverlay);
