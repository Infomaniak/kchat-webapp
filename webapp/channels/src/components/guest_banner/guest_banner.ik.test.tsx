import {render, screen} from '@testing-library/react';
import React from 'react';
import {IntlProvider} from 'react-intl';

import GuestBanner from './guest_banner';

jest.mock('./guest_list_modal', () => () => <span data-testid='GuestListModal'/>);

describe('components/guest_banner/guest_banner', () => {
    const actions = {
        getChannelGuestMembers: jest.fn().mockResolvedValue({}),
    };

    const renderWithIntl = (ui: React.ReactElement) =>
        render(<IntlProvider locale='en'>{ui}</IntlProvider>);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders when there are guests and current user is not a guest', () => {
        renderWithIntl(
            <GuestBanner
                channelId='channel-1'
                count={3}
                isGuest={false}
                actions={actions}
            />,
        );

        expect(document.querySelector('.GuestBanner')).toHaveTextContent(/There\s+in this conversation\./i);
        expect(document.querySelector('.GuestBanner')).toBeInTheDocument();
        expect(screen.getByTestId('GuestListModal')).toBeInTheDocument();
    });

    it('does not render when count is 0', () => {
        renderWithIntl(
            <GuestBanner
                channelId='channel-1'
                count={0}
                isGuest={false}
                actions={actions}
            />,
        );

        expect(document.querySelector('.GuestBanner')).not.toBeInTheDocument();
    });

    it('does not render when current user is a guest', () => {
        renderWithIntl(
            <GuestBanner
                channelId='channel-1'
                count={2}
                isGuest={true}
                actions={actions}
            />,
        );

        expect(document.querySelector('.GuestBanner')).not.toBeInTheDocument();
    });

    it('fetches guest members on mount when channelId is provided', () => {
        renderWithIntl(
            <GuestBanner
                channelId='channel-1'
                count={2}
                isGuest={false}
                actions={actions}
            />,
        );

        expect(actions.getChannelGuestMembers).toHaveBeenCalledWith('channel-1');
    });
});
