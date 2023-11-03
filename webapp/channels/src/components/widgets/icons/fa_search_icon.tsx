// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {t} from 'utils/i18n';

import LocalizedIcon from 'components/localized_icon';

export default function SearchIcon() {
    return (
        <LocalizedIcon
            className='fa fa-search'
            title={{id: t('generic_icons.search'), defaultMessage: 'Search Icon'}}
        />
    );
}
