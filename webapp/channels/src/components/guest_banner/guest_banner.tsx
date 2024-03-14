import classNames from 'classnames';
import React from 'react';
import type {FC} from 'react';
import {FormattedMessage} from 'react-intl';

import './guest_banner.scss';

import InfoIconFilled from 'components/widgets/icons/info_icon_filled';

import type {GuestBannerConnectorProps} from '.';

type Props = GuestBannerConnectorProps & {
    count: number;
    isGuest: boolean;
}

const GuestBanner: FC<Props> = ({count, isGuest}) => {
    return (count && !isGuest ? <div className={classNames('GuestBanner')}>
        <InfoIconFilled className={'InfoIcon'}/>
        <FormattedMessage
            id='guest_banner.text'
            defaultMessage='There are {count} external users in this conversation.There {count, plural, one {is} other {are}} {count} external {count, plural, one {user} other {users}} in this conversation.'
            values={{count}}
        />
    </div> : <></>);
};

export default GuestBanner;
