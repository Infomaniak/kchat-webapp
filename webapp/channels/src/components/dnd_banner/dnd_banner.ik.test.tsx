import {render} from '@testing-library/react';
import React from 'react';
import {IntlProvider} from 'react-intl';

import DndBanner from './dnd_banner';

describe('components/dnd_banner/dnd_banner', () => {
    const intlProviderProps = {
        locale: 'en',
        messages: {
            'dnd_banner.text': 'User {name} is in Do Not Disturb',
        },
    };

    const renderWithIntl = (ui: React.ReactElement) =>
        render(<IntlProvider {...intlProviderProps}>{ui}</IntlProvider>);

    it('renders when shouldDisplay is true and name is provided', () => {
        const {container} = renderWithIntl(
            <DndBanner
                channelId='channel-1'
                shouldDisplay={true}
                name='John'
            />,
        );

        expect(container.querySelector('.DndBanner')).toBeInTheDocument();
    });

    it('does not render when shouldDisplay is false', () => {
        const {container} = renderWithIntl(
            <DndBanner
                channelId='channel-1'
                shouldDisplay={false}
                name='John'
            />,
        );

        expect(container.querySelector('.DndBanner')).not.toBeInTheDocument();
    });

    it('does not render when name is missing even if shouldDisplay is true', () => {
        const {container} = renderWithIntl(
            <DndBanner
                channelId='channel-1'
                shouldDisplay={true}
            />,
        );

        expect(container.querySelector('.DndBanner')).not.toBeInTheDocument();
    });
});
