import React, {useEffect} from 'react';

// this component is used to show kSuite conversions modals
// we have only one markup element and we trigger it programmatically
export const WcModal = () => {
    useEffect(() => {
        customElements.whenDefined('wc-ksuite-pro-upgrade-dialog').then(() => console.log('wc-ksuite-pro-upgrade-dialog is defined !!!!'));
        customElements.whenDefined('wc-icon').then(() => console.log('wc-icon is defined !!!!'));
    }, []);
    return (
        <wc-ksuite-pro-upgrade-dialog id='wc-modal'>
            <div slot='trigger-element'/>
        </wc-ksuite-pro-upgrade-dialog>
    );
};
