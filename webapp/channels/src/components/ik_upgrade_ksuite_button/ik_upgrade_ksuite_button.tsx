import type {ReactNode} from 'react';
import React, {useEffect, useRef} from 'react';

import {useNextPlan} from 'components/common/hooks/useNextPlan';

type Props = {
    label?: string;
    children?: ReactNode;
    className?: string;
    onReady?: () => void;
}

/**
 * UpgradeButton wraps content in <wc-ksuite-pro-upgrade-dialog>.
 *
 * - If `label` is provided, renders with an <wc-ksuite-pro-upgrade-button>.
 * - If `children` is provided (and no `label`), it renders custom content with added <wc-ksuite-pro-upgrade-tag>.
 * - If `onReady` is provided, it's called when the WC is mounted and ready.
 */
export default function UpgradeKsuiteButton({label, children, className, onReady}: Props) {
    const nextPlan = useNextPlan();
    const dialogRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = dialogRef.current;
        if (el?.componentOnReady) {
            el.componentOnReady().then(() => {
                onReady?.();
            });
        }
    }, [onReady]);

    return (
        <wc-ksuite-pro-upgrade-dialog
            ref={dialogRef}
            offer={nextPlan}
            class={className}
        >
            {label ? (
                <wc-ksuite-pro-upgrade-button
                    style={{whiteSpace: 'nowrap', overflow: 'hidden'}}
                    slot='trigger-element'
                    button-text={label}
                />
            ) : (
                <div
                    slot='trigger-element'
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                    }}
                >
                    {children}
                    <wc-ksuite-pro-upgrade-tag/>
                </div>
            )}
        </wc-ksuite-pro-upgrade-dialog>
    );
}
