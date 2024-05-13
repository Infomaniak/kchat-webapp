// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useInteractions,
    FloatingFocusManager,
    useDismiss,
} from '@floating-ui/react';
import type {Locale} from 'date-fns';
import React, {useCallback, useEffect, useState} from 'react';
import type {DayPickerProps} from 'react-day-picker';
import {DayPicker} from 'react-day-picker';

import {getDatePickerLocalesForDateFns} from 'utils/utils';

import 'react-day-picker/dist/style.css';
import './date_picker.scss';

type Props = {
    children: React.ReactNode;
    datePickerProps: DayPickerProps;
    isPopperOpen: boolean;
    locale: string;
    handlePopperOpenState: (isOpen: boolean) => void;
}

const DatePicker = ({children, datePickerProps, isPopperOpen, handlePopperOpenState, locale}: Props) => {
    const [loadedLocales, setLoadedLocales] = useState<Record<string, Locale>>({});
    const {x, y, strategy, context, refs: {setReference, setFloating}} = useFloating({
        open: isPopperOpen,
        onOpenChange: () => handlePopperOpenState(false),
        placement: 'bottom-start',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({fallbackPlacements: ['bottom-end', 'top-start', 'top-end', 'right-start', 'left-start'], padding: 5}),
            shift(),
        ],
    });

    const {getReferenceProps, getFloatingProps} = useInteractions([
        useDismiss(context, {
            enabled: true,
            outsidePress: true,
        }),
    ]);

    useEffect(() => {
        setLoadedLocales(getDatePickerLocalesForDateFns(locale, loadedLocales));
    }, [loadedLocales, locale]);

    const iconLeft = useCallback(() => {
        return (
            <i className='icon icon-chevron-left'/>
        );
    }, []);

    const iconRight = useCallback(() => {
        return (
            <i className='icon icon-chevron-right'/>
        );
    }, []);

    return (
        <div>
            <div
                ref={setReference}
                {...getReferenceProps()}
            >
                {children}
            </div>
            {isPopperOpen && (
                <FloatingFocusManager
                    context={context}
                    modal={true}
                    initialFocus={-1}
                >
                    <div
                        ref={setFloating}
                        style={{
                            position: strategy,
                            top: y ?? 0,
                            left: x ?? 0,
                            width: 'auto',
                            zIndex: 999,
                        }}
                        {...getFloatingProps()}
                    >
                        <DayPicker
                            {...datePickerProps}
                            className='date-picker__popper'
                            locale={loadedLocales[locale]}
                            components={{
                                IconRight: iconRight,
                                IconLeft: iconLeft,
                            }}
                            ISOWeek={true}
                        />
                    </div>
                </FloatingFocusManager>
            )}
        </div>
    );
};

export default DatePicker;
