// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {act} from 'react-dom/test-utils';

import {GenericModal} from '@mattermost/components';
import type {ChannelType} from '@mattermost/types/channels';
import type {DeepPartial} from '@mattermost/types/utilities';

import {createChannel} from 'mattermost-redux/actions/channels';
import Permissions from 'mattermost-redux/constants/permissions';

import {openChannelLimitModalIfNeeded} from 'actions/cloud';

import Input from 'components/widgets/inputs/input/input';
import PublicPrivateSelector from 'components/widgets/public-private-selector/public-private-selector';

import Constants, {suitePluginIds} from 'utils/constants';
import {cleanUpUrlable} from 'utils/url';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import {
    renderWithContext,
    screen,
    userEvent,

    // waitFor,
} from 'tests/react_testing_utils';

import type {GlobalState} from 'types/store';

jest.mock('mattermost-redux/actions/channels');
jest.mock('mattermost-redux/actions/cloud', () => ({
    openChannelLimitModalIfNeeded: jest.fn,
}));

import NewChannelModal from './new_channel_modal';

import {shallow} from 'enzyme';
import ChannelNameFormField from 'components/channel_name_form_field/channel_name_form_field';

describe('components/new_channel_modal', () => {
    const initialState: DeepPartial<GlobalState> = {
        entities: {
            general: {
                config: {},
            },
            channels: {
                currentChannelId: 'current_channel_id',
                channels: {
                    current_channel_id: {
                        id: 'current_channel_id',
                        display_name: 'Current channel',
                        name: 'current_channel',
                    },
                },
                roles: {
                    current_channel_id: new Set([
                        'channel_user',
                        'channel_admin',
                    ]),
                },
            },
            teams: {
                currentTeamId: 'current_team_id',
                myMembers: {
                    current_team_id: {
                        roles: 'team_user team_admin',
                    },
                },
                teams: {
                    current_team_id: {
                        id: 'current_team_id',
                        description: 'Curent team description',
                        name: 'current-team',
                    },
                },
                usage: {
                    storage: 0,
                    public_channels: 0,
                    private_channels: 0,
                    guests: 0,
                    members: 0,
                    files: {
                        totalStorage: 0,
                    },
                    messages: {
                        history: 0,
                    },
                    teams: {
                        active: 0,
                        cloudArchived: 0,
                    },
                    boards: {
                        cards: 0,
                    },
                    usageLoaded: true,
                },
                cloud: {
                    limits: {
                        limits: {
                            storage: 10,
                            public_channels: 10,
                            private_channels: 10,
                            guests: 10,
                            members: 10,
                        },
                        limitsLoaded: true,
                    },
                },
            },
            preferences: {
                myPreferences: {},
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_admin system_user'},
                },
            },
            roles: {
                roles: {
                    channel_admin: {
                        permissions: [],
                    },
                    channel_user: {
                        permissions: [],
                    },
                    team_admin: {
                        permissions: [],
                    },
                    team_user: {
                        permissions: [
                            Permissions.CREATE_PRIVATE_CHANNEL,
                        ],
                    },
                    system_admin: {
                        permissions: [
                            Permissions.CREATE_PUBLIC_CHANNEL,
                        ],
                    },
                    system_user: {
                        permissions: [],
                    },
                },
            },
        },
        plugins: {
            plugins: {focalboard: {id: suitePluginIds.focalboard}},
        },
    };

    test('should match component state with given props', () => {
        renderWithContext(
            <NewChannelModal/>,
            initialState,
        );

        const heading = screen.getByRole('heading');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveAttribute('id', 'genericModalLabel');
        expect(heading.parentElement).toHaveClass('GenericModal__header');
        expect(heading).toHaveTextContent('Create a new channel');

        const channelNameHeading = screen.getByText('Channel name');
        expect(channelNameHeading).toBeInTheDocument();
        expect(channelNameHeading).toHaveClass('Input_legend Input_legend___focus');

        const channelNameInput = screen.getByPlaceholderText('Enter a name for your new channel');
        expect(channelNameInput).toBeInTheDocument();
        expect(channelNameInput).toHaveAttribute('value', '');
        expect(channelNameInput).toHaveAttribute('type', 'text');
        expect(channelNameInput).toHaveAttribute('name', 'new-channel-modal-name');
        expect(channelNameInput).toHaveAttribute('id', 'input_new-channel-modal-name');
        expect(channelNameInput).toHaveClass('Input form-control medium new-channel-modal-name-input Input__focus');

        const editUrl = screen.getByText('Edit');
        expect(editUrl).toBeInTheDocument();
        expect(editUrl).toHaveClass('url-input-button-label');
        expect(editUrl.parentElement).toHaveClass('url-input-button');

        const publicChannelSvg = screen.getByLabelText('Globe Circle Solid Icon');
        expect(publicChannelSvg).toBeInTheDocument();

        const publicChannelHeading = screen.getByText('Public Channel');
        expect(publicChannelHeading).toBeInTheDocument();
        expect(publicChannelHeading.nextSibling).toHaveTextContent('Anyone can join');

        const privateChannelSvg = screen.getByLabelText('Lock Circle Solid Icon');
        expect(privateChannelSvg).toBeInTheDocument();

        const privateChannelHeading = screen.getByText('Private Channel');
        expect(privateChannelHeading).toBeInTheDocument();
        expect(privateChannelHeading.nextSibling).toHaveTextContent('Only invited members');

        const purposeTextArea = screen.getByPlaceholderText('Enter a purpose for this channel (optional)');
        expect(purposeTextArea).toBeInTheDocument();
        expect(purposeTextArea).toHaveClass('new-channel-modal-purpose-textarea');

        const purposeDesc = screen.getByText('This will be displayed when browsing for channels.');
        expect(purposeDesc).toBeInTheDocument();

        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton).toBeInTheDocument();
        expect(cancelButton).toHaveClass('btn-tertiary');

        const createChannelButton = screen.getByText('Create channel');
        expect(createChannelButton).toBeInTheDocument();
        expect(createChannelButton).toHaveClass('btn-primary');
        expect(createChannelButton).toBeDisabled();
    });

    test('should handle display name change', () => {
        const value = 'Channel name';

        renderWithContext(
            <NewChannelModal/>,
            initialState,
        );

        // Change display name
        const channelNameInput = screen.getByPlaceholderText('Enter a name for your new channel');
        expect(channelNameInput).toBeInTheDocument();
        expect(channelNameInput).toHaveAttribute('value', '');

        userEvent.type(channelNameInput, value);

        // Display name should have been updated
        expect(channelNameInput).toHaveAttribute('value', value);

        // URL should have been changed according to display name
        const urlInputLabel = screen.getByTestId('urlInputLabel');
        expect(urlInputLabel).toHaveTextContent(cleanUpUrlable(value));
    });

    // test('should handle url change', async () => {
    //     const value = 'Channel name';
    //     const mockInputChangeEvent = {
    //         preventDefault: jest.fn(),
    //         target: {
    //             value,
    //         },
    //     } as unknown as React.ChangeEvent<HTMLInputElement>;
    //     const mockInputChangeUpdatedEvent = {
    //         preventDefault: jest.fn(),
    //         target: {
    //             value: `${value} updated`,
    //         },
    //     } as unknown as React.ChangeEvent<HTMLInputElement>;

    //     const url = 'channel-name-new';
    //     const mockURLInputChangeEvent = {
    //         preventDefault: jest.fn(),
    //         target: {
    //             value: url,
    //         },
    //     } as unknown as React.ChangeEvent<HTMLInputElement>;

        // renderWithContext(
        //     <NewChannelModal/>,
        //     initialState,
        // );

    //     // Change display name
    //     const input = wrapper.find(ChannelNameFormField).first();
    //     input.props().onDisplayNameChange!(mockInputChangeEvent.target.value);

    //     // URL should have been changed according to display name
    //     // let urlInput = wrapper.find(URLInput);
    //     // expect(wrapper.state().urlError).toEqual('');

    //     // Change URL
    //     input.props().onURLChange!(mockURLInputChangeEvent.target.value);

    //     // URL should have been updated
    //     // const test = wrapper.find('.new-channel-modal__url');
    //     // expect(test.value).toEqual(url);

    //     // Change display name again
    //     // input = wrapper.find(Input).first();
    //     input.props().onDisplayNameChange!(mockInputChangeUpdatedEvent.target.value);

    //     // URL should NOT be updated
    //     // urlInput = wrapper.find(URLInput);
    //     expect(input.state().url).toEqual(url);
    // });

    test('should handle type changes', () => {
        renderWithContext(
            <NewChannelModal/>,
            initialState,
        );

        // Change type to private
        const privateChannel = screen.getByText('Private Channel');
        expect(privateChannel).toBeInTheDocument();

        userEvent.click(privateChannel);

        // Type should have been updated to private
        expect(privateChannel.parentElement?.nextSibling?.firstChild).toHaveAttribute('aria-label', 'Check Circle Icon');

        // Change type to public
        const publicChannel = screen.getByText('Public Channel');
        expect(publicChannel).toBeInTheDocument();

        userEvent.click(publicChannel);

        // Type should have been updated to public
        expect(publicChannel.parentElement?.nextSibling?.firstChild).toHaveAttribute('aria-label', 'Check Circle Icon');
    });

    test('should handle purpose changes', () => {
        const value = 'Purpose';

        renderWithContext(
            <NewChannelModal/>,
            initialState,
        );

        // Change purpose
        const ChannelPurposeTextArea = screen.getByPlaceholderText('Enter a purpose for this channel (optional)');
        expect(ChannelPurposeTextArea).toBeInTheDocument();

        userEvent.click(ChannelPurposeTextArea);
        userEvent.type(ChannelPurposeTextArea, value);

        // Purpose should have been updated
        expect(ChannelPurposeTextArea).toHaveValue(value);
    });

    test('should enable confirm button when having valid display name, url and type', () => {
        renderWithContext(
            <NewChannelModal/>,
            initialState,
        );

        // Confirm button should be disabled
        const createChannelButton = screen.getByText('Create channel');
        expect(createChannelButton).toBeInTheDocument();
        expect(createChannelButton).toBeDisabled();

        // Change display name
        const channelNameInput = screen.getByPlaceholderText('Enter a name for your new channel');
        expect(channelNameInput).toBeInTheDocument();
        expect(channelNameInput).toHaveAttribute('value', '');

        userEvent.type(channelNameInput, 'Channel name');

        // Change type to private
        const privateChannel = screen.getByText('Private Channel');
        expect(privateChannel).toBeInTheDocument();

        userEvent.click(privateChannel);

        // Confirm button should be enabled
        expect(createChannelButton).toBeEnabled();
    });

    test('should disable confirm button when display name in error', () => {
        renderWithContext(
            <NewChannelModal/>,
            initialState,
        );

        // Change display name
        const channelNameInput = screen.getByPlaceholderText('Enter a name for your new channel');
        expect(channelNameInput).toBeInTheDocument();
        expect(channelNameInput).toHaveAttribute('value', '');

        userEvent.type(channelNameInput, 'Channel name');

        // Change type to private
        const privateChannel = screen.getByText('Private Channel');
        expect(privateChannel).toBeInTheDocument();

        userEvent.click(privateChannel);

        // Confirm button should be enabled
        const createChannelButton = screen.getByText('Create channel');
        expect(createChannelButton).toBeEnabled();

        // Change display name to invalid
        userEvent.clear(channelNameInput);

        // Confirm button should be disabled
        expect(createChannelButton).toBeDisabled();
    });

    test('should disable confirm button when url in error', () => {
        renderWithContext(
            <NewChannelModal/>,
            initialState,
        );

        // Change display name
        const channelNameInput = screen.getByPlaceholderText('Enter a name for your new channel');
        expect(channelNameInput).toBeInTheDocument();
        expect(channelNameInput).toHaveAttribute('value', '');

        userEvent.type(channelNameInput, 'Channel name');

        // Change type to private
        const privateChannel = screen.getByText('Private Channel');
        expect(privateChannel).toBeInTheDocument();

        userEvent.click(privateChannel);

        // Confirm button should be enabled
        const createChannelButton = screen.getByText('Create channel');
        expect(createChannelButton).toBeEnabled();

        // Change url to invalid
        const editUrl = screen.getByText('Edit');
        expect(editUrl).toBeInTheDocument();

        userEvent.click(editUrl);

        const editUrlInput = screen.getByTestId('channelURLInput');
        userEvent.clear(editUrlInput);
        userEvent.type(editUrlInput, 'c-');

        // Confirm button should be disabled
        expect(createChannelButton).toBeDisabled();
    });

    test('should disable confirm button when server error', async () => {
        // render(
        //     <NewChannelModal/>,
        // );

        // // Confirm button should be disabled
        // const createChannelButton = screen.getByText('Create channel');
        // expect(createChannelButton).toBeDisabled();

        // // Change display name
        // const channelNameInput = screen.getByPlaceholderText('Enter a name for your new channel');
        // expect(channelNameInput).toBeInTheDocument();
        // expect(channelNameInput).toHaveAttribute('value', '');

        // userEvent.type(channelNameInput, 'Channel name');

        // // Change type to private
        // const privateChannel = screen.getByText('Private Channel');
        // expect(privateChannel).toBeInTheDocument();

        // userEvent.click(privateChannel);

        // // Confirm button should be enabled
        // expect(createChannelButton).toBeEnabled();

        // // Submit
        // await act(async () => userEvent.click(createChannelButton));

        // const serverError = screen.getByText('Something went wrong. Please try again.');
        // expect(serverError).toBeInTheDocument();
        // expect(createChannelButton).toBeDisabled();
        const mockChangeEvent = {
            preventDefault: jest.fn(),
            target: {
                value: 'Channel name',
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        renderWithContext(
            <NewChannelModal/>,
            initialState,
        );

        // Confirm button should be disabled
        let genericModal = wrapper.find(GenericModal);
        expect(genericModal.props().isConfirmDisabled).toEqual(true);

        // Change display name
        const input = wrapper.find(ChannelNameFormField).first();
        input.props().onDisplayNameChange!(mockChangeEvent.target.value);

        // Change type to private
        const selector = wrapper.find(PublicPrivateSelector);
        selector.props().onChange!(Constants.PRIVATE_CHANNEL as ChannelType);

        // Confirm button should be enabled
        genericModal = wrapper.find(GenericModal);
        expect(genericModal.props().isConfirmDisabled).toEqual(false);

        // Submit
        await genericModal.props().handleConfirm!();

        genericModal = wrapper.find(GenericModal);
        expect(genericModal.props().errorText).toEqual('Something went wrong. Please try again.');
        expect(genericModal.props().isConfirmDisabled).toEqual(true);
    });

    // test('should request team creation on submit', async () => {
    //     const name = 'Channel name';

        // renderWithContext(
        //     <NewChannelModal/>,
        //     initialState,
        // );

    //     const wrapper = mountWithIntl(
    //         <NewChannelModal/>,
    //     );

    //     const genericModal = wrapper.find('GenericModal');
    //     const displayName = genericModal.find('.new-channel-modal-name-input');
    //     const confirmButton = genericModal.find('button[type=\'submit\']');

    //     // Confirm button should be disabled
    //     expect((confirmButton.instance() as unknown as HTMLButtonElement).disabled).toEqual(true);

    //     // Enter data
    //     displayName.simulate('change', mockChangeEvent);

    //     // Display name should be updated
    //     expect((displayName.instance() as unknown as HTMLInputElement).value).toEqual(name);

    //     // Confirm button should be enabled
    //     expect((confirmButton.instance() as unknown as HTMLButtonElement).disabled).toEqual(false);

    //     // Submit
    //     await act(async () => {
    //         confirmButton.simulate('click');
    //     });

    //     // Request should be sent
    //     expect(createChannel).toHaveBeenCalledWith({
    //         create_at: 0,
    //         creator_id: '',
    //         delete_at: 0,
    //         display_name: name,
    //         group_constrained: false,
    //         header: '',
    //         id: '',
    //         last_post_at: 0,
    //         last_root_post_at: 0,
    //         name: 'channel-name',
    //         purpose: '',
    //         scheme_id: '',
    //         team_id: 'current_team_id',
    //         type: 'O',
    //         update_at: 0,
    //     }, '', openChannelLimitModalIfNeeded);
    // });
});
