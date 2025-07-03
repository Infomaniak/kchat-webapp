import type {ReactNode} from 'react';
import React from 'react';

import {useNextPlan} from 'components/common/hooks/useNextPlan';

type Props = {
    label?: string;
    children?: ReactNode;
    className?: string;
}

/**
 * UpgradeButton wraps content in <wc-ksuite-pro-upgrade-dialog>.
 *
 * - If `label` is provided, renders with an <wc-ksuite-pro-upgrade-button>.
 * - If `children` is provided (and no `label`), it renders custom content with added <wc-ksuite-pro-upgrade-tag>.
 */
export default function UpgradeKsuiteButton({label, children, className}: Props) {
    const nextPlan = useNextPlan();

    return (
        <wc-ksuite-pro-upgrade-dialog
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
