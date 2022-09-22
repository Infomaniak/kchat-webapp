// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import LocalizedIcon from 'components/localized_icon';

import {t} from 'utils/i18n';

import ShowUnreadsCategory from './show_unreads_category';
import LimitVisibleGMsDMs from './limit_visible_gms_dms';

export interface Props {
    updateSection: (section: string) => void;
    activeSection?: string;
    closeModal: () => void;
    collapseModal: () => void;
}

export default function RhsSettingsSidebar(props: Props): JSX.Element {
    return (
        <div id='displaySettings'>
            <div className='user-settings user-rhs-container container'>
                <div className='divider-dark first'/>
                <div className='divider-dark'/>
                <LimitVisibleGMsDMs
                    active={props.activeSection === 'limitVisibleGMsDMs'}
                    updateSection={props.updateSection}
                />
                <div className='divider-dark'/>
            </div>
        </div>
    );
}
