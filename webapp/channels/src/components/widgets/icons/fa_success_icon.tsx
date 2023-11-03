// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {t} from 'utils/i18n';

import LocalizedIcon from 'components/localized_icon';

export default function SuccessIcon() {
    return (
        <LocalizedIcon
            className='fa fa-check'
            title={{id: t('generic_icons.success'), defaultMessage: 'Success Icon'}}
        />
    );
}
