// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {PrimitiveType, FormatXMLElementFn} from 'intl-messageformat';
import type {InputHTMLAttributes} from 'react';
import React from 'react';
import type {MessageDescriptor} from 'react-intl';
import {useIntl} from 'react-intl';

export type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
    placeholder: MessageDescriptor & {
        values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>;
    };
};

const LocalizedInput = React.forwardRef((props: Props, ref?: React.Ref<HTMLInputElement>) => {
    const {
        placeholder: {
            id,
            defaultMessage,
            values,
        },
        ...otherProps
    } = props;

    const {formatMessage} = useIntl();

    return (
        <input
            {...otherProps}
            ref={ref}
            placeholder={formatMessage({id, defaultMessage}, values)}
        />
    );
});
LocalizedInput.displayName = 'LocalizedInput';

export default LocalizedInput;
