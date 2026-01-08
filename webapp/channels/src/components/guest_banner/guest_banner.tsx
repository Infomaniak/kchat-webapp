import classNames from 'classnames';
import React, {useEffect} from 'react';
import type {FC} from 'react';
import {FormattedMessage} from 'react-intl';

import TextBanner from 'components/text_banner';
import InfoIconFilled from 'components/widgets/icons/info_icon_filled';

import type {ActionResult} from 'types/store';

import GuestListModal from './guest_list_modal';

import type {GuestBannerConnectorProps} from '.';

export type Props = GuestBannerConnectorProps & {
    count: number;
    isGuest: boolean;

    actions: {
        getChannelGuestMembers: (channelId: string) => Promise<ActionResult<unknown, any>>;
    };
}

const GuestBanner: FC<Props> = ({count, isGuest, channelId, actions}) => {
    useEffect(() => {
        const fetchData = async () => {
            await actions.getChannelGuestMembers(channelId);
        };

        if (channelId) {
            fetchData();
        }
    }, [actions, channelId]);

    return (count && !isGuest ? <TextBanner className={classNames('GuestBanner')}>
        <InfoIconFilled className={'InfoIcon'}/>
        <FormattedMessage
            id='guest_banner.text'
            defaultMessage='There {slot} in this conversation.'
            values={{
                slot: (
                    <GuestListModal
                        count={count}
                        channelId={channelId}
                    />
                ),
                count,
            }}
        />
    </TextBanner> : <></>);
};

export default GuestBanner;
