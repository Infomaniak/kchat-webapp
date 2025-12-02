import {fireEvent, screen} from '@testing-library/react';
import React from 'react';

import type EmojiMap from 'utils/emoji_map';

import {renderWithContext} from 'tests/react_testing_utils';

import IkWelcomeButtons from './ik_welcome_buttons';

jest.mock('mattermost-redux/utils/emoji_utils', () => {
    return {
        getEmojiImageUrl: jest.fn(() => ''),
    };
});

describe('components/IkWelcomeButtons', () => {
    const baseProps = {
        actions: {
            openModal: jest.fn(),
        },
        emojiMap: new Map() as unknown as EmojiMap,
    };

    test('should match snapshot', () => {
        const {container} = renderWithContext(
            <IkWelcomeButtons {...baseProps}/>,
        );
        expect(container).toMatchSnapshot();
    });

    test('should open DM modal when clicking "Write to someone"', () => {
        renderWithContext(
            <IkWelcomeButtons {...baseProps}/>,
        );

        const writeButton = screen.getByText(/Write to someone/i);
        fireEvent.click(writeButton);

        expect(baseProps.actions.openModal).toHaveBeenCalledWith(expect.objectContaining({
            modalId: 'create_dm_channel',
            dialogProps: {isExistingChannel: false},
        }));
    });

    test('should open Quick Switch modal when clicking "Browse channels"', () => {
        renderWithContext(
            <IkWelcomeButtons {...baseProps}/>,
        );

        const browseButton = screen.getByText(/Browse channels/i);
        fireEvent.click(browseButton);

        expect(baseProps.actions.openModal).toHaveBeenCalledWith(expect.objectContaining({
            modalId: 'quick_switch',
        }));
    });

    test('should open apps link in new tab when clicking "Download the apps"', () => {
        const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

        renderWithContext(
            <IkWelcomeButtons {...baseProps}/>,
        );

        const downloadButton = screen.getByText(/Download the apps/i);
        fireEvent.click(downloadButton);

        expect(windowOpenSpy).toHaveBeenCalledWith(
            'https://infomaniak.com/gtl/apps.kchat',
            '_blank',
            'noopener,noreferrer',
        );

        windowOpenSpy.mockRestore();
    });
});
