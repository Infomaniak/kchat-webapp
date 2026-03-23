// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {Channel, ChannelType} from '@mattermost/types/channels';

import {EditChannelHeaderModal} from 'components/edit_channel_header_modal/edit_channel_header_modal';
import type {EditChannelHeaderModal as EditChannelHeaderModalClass} from 'components/edit_channel_header_modal/edit_channel_header_modal';
import Textbox from 'components/textbox';

import Constants from 'utils/constants';
import {execCommandInsertText} from 'utils/exec_commands';
import * as pasteUtils from 'utils/paste';
import * as Utils from 'utils/utils';

import {type MockIntl} from 'tests/helpers/intl-test-helper';
import {testComponentForLineBreak} from 'tests/helpers/line_break_helpers';

jest.mock('utils/exec_commands', () => ({
    execCommandInsertText: jest.fn(),
}));

const KeyCodes = Constants.KeyCodes;

describe('components/EditChannelHeaderModal', () => {
    const timestamp = Utils.getTimestamp();
    const channel = {
        id: 'fake-id',
        create_at: timestamp,
        update_at: timestamp,
        delete_at: timestamp,
        team_id: 'fake-team-id',
        type: Constants.OPEN_CHANNEL as ChannelType,
        display_name: 'Fake Channel',
        name: 'Fake Channel',
        header: 'Fake Channel',
        purpose: 'purpose',
        last_post_at: timestamp,
        creator_id: 'fake-creator-id',
        scheme_id: 'fake-scheme-id',
        group_constrained: false,
        last_root_post_at: timestamp,
    };

    const serverError = {
        server_error_id: 'fake-server-error',
        message: 'some error',
    };

    const baseProps = {
        markdownPreviewFeatureIsEnabled: false,
        channel,
        ctrlSend: false,
        show: false,
        shouldShowPreview: false,
        onExited: jest.fn(),
        actions: {
            setShowPreview: jest.fn(),
            patchChannel: jest.fn().mockResolvedValue({}),
        },
        intl: {
            formatMessage: ({defaultMessage}) => defaultMessage,
        } as MockIntl,
    };

    test('should match snapshot, init', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('edit direct message channel', () => {
        const dmChannel: Channel = {
            ...channel,
            type: Constants.DM_CHANNEL as ChannelType,
        };

        const wrapper = shallow(
            <EditChannelHeaderModal
                {...baseProps}
                channel={dmChannel}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('submitted', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({saving: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('error with intl message', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({serverError: {...serverError, server_error_id: 'model.channel.is_valid.header.app_error'}});
        expect(wrapper).toMatchSnapshot();
    });

    test('error without intl message', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({serverError});
        expect(wrapper).toMatchSnapshot();
    });

    describe('handleSave', () => {
        test('on no change, should hide the modal without trying to patch a channel', async () => {
            const wrapper = shallow(
                <EditChannelHeaderModal {...baseProps}/>,
            );

            const instance = wrapper.instance() as EditChannelHeaderModalClass;

            await instance.handleSave();

            expect(wrapper.state('show')).toBe(false);

            expect(baseProps.actions.patchChannel).not.toHaveBeenCalled();
        });

        test('on error, should not close modal and set server error state', async () => {
            baseProps.actions.patchChannel.mockResolvedValueOnce({error: serverError});

            const wrapper = shallow(
                <EditChannelHeaderModal {...baseProps}/>,
            );

            const instance = wrapper.instance() as EditChannelHeaderModalClass;

            wrapper.setState({header: 'New header'});

            await instance.handleSave();

            expect(wrapper.state('show')).toBe(true);
            expect(wrapper.state('serverError')).toBe(serverError);

            expect(baseProps.actions.patchChannel).toHaveBeenCalled();
        });

        test('on success, should close modal', async () => {
            const wrapper = shallow(
                <EditChannelHeaderModal {...baseProps}/>,
            );

            const instance = wrapper.instance() as EditChannelHeaderModalClass;

            wrapper.setState({header: 'New header'});

            await instance.handleSave();

            expect(wrapper.state('show')).toBe(false);

            expect(baseProps.actions.patchChannel).toHaveBeenCalled();
        });
    });

    test('change header', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.find(Textbox).simulate('change', {target: {value: 'header'}});

        expect(
            wrapper.state('header'),
        ).toBe('header');
    });

    test('patch on save button click', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find('.save-button').simulate('click');

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    test('patch on enter keypress event with ctrl', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal
                {...baseProps}
                ctrlSend={true}
            />,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find(Textbox).simulate('keypress', {
            preventDefault: jest.fn(),
            key: KeyCodes.ENTER[0],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: true,
        });

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    test('patch on enter keypress', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find(Textbox).simulate('keypress', {
            preventDefault: jest.fn(),
            key: KeyCodes.ENTER[0],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: false,
        });

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    test('patch on enter keydown', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal
                {...baseProps}
                ctrlSend={true}
            />,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find(Textbox).simulate('keydown', {
            preventDefault: jest.fn(),
            key: KeyCodes.ENTER[0],
            keyCode: KeyCodes.ENTER[1],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: true,
        });

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    describe('handlePaste', () => {
        const createClipboardEvent = (overrides: Partial<ClipboardEvent> = {}): ClipboardEvent => {
            const event = {
                clipboardData: {
                    getData: jest.fn().mockReturnValue(''),
                    types: ['text/plain'],
                } as unknown as DataTransfer,
                target: {
                    selectionStart: 0,
                    selectionEnd: 0,
                } as unknown as EventTarget,
                preventDefault: jest.fn(),
                ...overrides,
            } as unknown as ClipboardEvent;
            return event;
        };

        beforeEach(() => {
            jest.spyOn(pasteUtils, 'hasHtmlLink').mockReturnValue(false);
            jest.spyOn(pasteUtils, 'isTextUrl').mockReturnValue(false);
            jest.spyOn(pasteUtils, 'formatMarkdownMessage').mockReturnValue({formattedMessage: '', formattedMarkdown: ''});
            jest.spyOn(pasteUtils, 'formatMarkdownLinkMessage').mockReturnValue('');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should do nothing for plain text paste', () => {
            const wrapper = shallow(
                <EditChannelHeaderModal {...baseProps}/>,
            );
            const event = createClipboardEvent();

            wrapper.find(Textbox).simulate('paste', event);

            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        test('should convert HTML link paste to markdown', () => {
            jest.spyOn(pasteUtils, 'hasHtmlLink').mockReturnValue(true);
            jest.spyOn(pasteUtils, 'formatMarkdownMessage').mockReturnValue({
                formattedMessage: 'full message',
                formattedMarkdown: '[link text](https://example.com)',
            });

            const wrapper = shallow(
                <EditChannelHeaderModal {...baseProps}/>,
            );
            const event = createClipboardEvent();

            wrapper.find(Textbox).simulate('paste', event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(pasteUtils.formatMarkdownMessage).toHaveBeenCalled();
            expect(execCommandInsertText).toHaveBeenCalledWith('[link text](https://example.com)');
        });

        test('should format URL pasted on selected text as markdown link', () => {
            jest.spyOn(pasteUtils, 'isTextUrl').mockReturnValue(true);
            jest.spyOn(pasteUtils, 'formatMarkdownLinkMessage').mockReturnValue('[selected text](https://example.com)');

            const wrapper = shallow(
                <EditChannelHeaderModal {...baseProps}/>,
            );
            const event = createClipboardEvent({
                target: {
                    selectionStart: 0,
                    selectionEnd: 13,
                } as unknown as EventTarget,
            });

            wrapper.find(Textbox).simulate('paste', event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(pasteUtils.formatMarkdownLinkMessage).toHaveBeenCalled();
            expect(execCommandInsertText).toHaveBeenCalledWith('[selected text](https://example.com)');
        });
    });

    testComponentForLineBreak(
        (value: string) => (
            <EditChannelHeaderModal
                {...baseProps}
                channel={{
                    ...baseProps.channel,
                    header: value,
                }}
            />
        ),
        (instance: any) => instance.state.header,
        false,
    );
});
