import React from 'react';

export type PackFeatureConfig<T> = {
    isEnabled: boolean;
    onAllowed: () => T;
    fallbackLabel?: React.ReactNode;
    modalContent?: React.ReactNode;
    modalRef: React.RefObject<any>;
};

export function getPackLimitedFeature<T>({
    isEnabled,
    onAllowed,
    fallbackLabel,
    modalContent,
    modalRef,
}: PackFeatureConfig<T>) {
    const onClick = isEnabled ? onAllowed : () => modalRef.current?.open();

    const Label = isEnabled ? null : (
        <span style={{whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px'}}>
            {fallbackLabel}
            <wc-ksuite-modal-conversion
                ref={modalRef}
                modalType='standard'
            >
                {modalContent || <wc-modal-conversion-tag/>}
            </wc-ksuite-modal-conversion>
        </span>
    );

    const Modal = isEnabled ? null : (
        <wc-ksuite-modal-conversion
            ref={modalRef}
            modalType='standard'
        >
            {modalContent || <wc-modal-conversion-tag/>}
        </wc-ksuite-modal-conversion>
    );

    return {onClick, Label, Modal};
}
