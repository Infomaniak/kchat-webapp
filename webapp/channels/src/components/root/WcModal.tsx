import React from 'react';

// this component is used to show kSuite conversions modals
// we have only one markup element and we trigger it programmatically
export const WcModal = () => {
    return (
        <wc-ksuite-pro-upgrade-dialog id='wc-modal'>
            <div slot='trigger-element'/>
        </wc-ksuite-pro-upgrade-dialog>
    );
};
