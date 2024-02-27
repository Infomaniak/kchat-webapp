// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CloseIcon} from '@infomaniak/compass-icons/components';
import {CloseSidePanelMessageKey, type KSuiteBridge} from '@infomaniak/ksuite-bridge';
import React from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    bridge: KSuiteBridge;
}

const CollapseLhsButton: React.FunctionComponent<Props> = (props: Props) => {
    if (!props.bridge.isConnected) {
        return null;
    }

    function closeSidepanel() {
        const {bridge} = props;
        bridge.sendMessage({type: CloseSidePanelMessageKey});
    }

    return (
        <button
            key='suite-sidebar-toggle'
            type='button'
            className='navbar-toggle navbar-right__icon pull-right'
            data-toggle='collapse'
            data-target='#suite-sidebar-toggle'
            onClick={closeSidepanel}
        >
            <span className='sr-only'>
                <FormattedMessage
                    id='navbar.toggle2'
                    defaultMessage='Close sidebar'
                />
            </span>
            <CloseIcon className='style--none icon icon__menu icon--sidebarHeaderTextColor'/>
        </button>
    );
};

export default CollapseLhsButton;
