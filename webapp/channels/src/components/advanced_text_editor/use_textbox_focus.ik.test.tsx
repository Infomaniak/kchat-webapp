// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {DeepPartial} from '@mattermost/types/utilities';

import {renderWithContext} from 'tests/react_testing_utils';

import type {GlobalState} from 'types/store';

import useTextboxFocus from './use_textbox_focus';

const mockFocus = jest.fn();
const mockBlur = jest.fn();

jest.mock('utils/user_agent', () => ({
    isMobile: () => false,
    isDesktopApp: () => false,
}));

function getBaseState(): DeepPartial<GlobalState> {
    return {
        views: {
            rhs: {
                isSidebarOpen: true,
                isSidebarExpanded: false,
                rhsFocusIntent: null,
            },
            rhsSuppressed: false,
        },
    };
}

type TestComponentProps = {
    channelId: string;
    isRHS: boolean;
    canPost?: boolean;
};

const TestComponent = ({channelId, isRHS, canPost = true}: TestComponentProps) => {
    const textboxRef = React.useRef({
        focus: mockFocus,
        blur: mockBlur,
    } as unknown);

    useTextboxFocus(textboxRef as React.RefObject<never>, channelId, isRHS, canPost);

    return (
        <div data-testid='test-component'>
            <span data-testid='channel-id'>{channelId}</span>
            <span data-testid='is-rhs'>{isRHS.toString()}</span>
        </div>
    );
};

describe('useTextboxFocus - channel switch focus behavior (IK custom)', () => {
    beforeEach(() => {
        mockFocus.mockClear();
        mockBlur.mockClear();
    });

    it('should focus main textbox when channel changes', () => {
        const initialState = getBaseState();
        const {rerender} = renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={false}
            />,
            initialState,
        );

        mockFocus.mockClear();

        rerender(
            <TestComponent
                channelId='channel_2'
                isRHS={false}
            />,
        );

        expect(mockFocus).toHaveBeenCalled();
    });

    it('should NOT focus RHS textbox when channel changes (prevents thread stealing focus)', () => {
        const initialState = getBaseState();
        const {rerender} = renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={true}
            />,
            initialState,
        );

        mockFocus.mockClear();

        rerender(
            <TestComponent
                channelId='channel_2'
                isRHS={true}
            />,
        );

        expect(mockFocus).not.toHaveBeenCalled();
    });

    it('should keep main textbox focused after multiple channel switches', () => {
        const initialState = getBaseState();
        const {rerender} = renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={false}
            />,
            initialState,
        );

        mockFocus.mockClear();

        rerender(
            <TestComponent
                channelId='channel_2'
                isRHS={false}
            />,
        );

        expect(mockFocus).toHaveBeenCalledTimes(1);
        mockFocus.mockClear();

        rerender(
            <TestComponent
                channelId='channel_3'
                isRHS={false}
            />,
        );

        expect(mockFocus).toHaveBeenCalledTimes(1);
    });

    it('should never focus RHS even after multiple channel switches', () => {
        const initialState = getBaseState();
        const {rerender} = renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={true}
            />,
            initialState,
        );

        mockFocus.mockClear();

        rerender(
            <TestComponent
                channelId='channel_2'
                isRHS={true}
            />,
        );

        rerender(
            <TestComponent
                channelId='channel_3'
                isRHS={true}
            />,
        );

        expect(mockFocus).not.toHaveBeenCalled();
    });

    it('should focus main textbox on mount when no rhsFocusIntent (navigating from Threads)', () => {
        const initialState: DeepPartial<GlobalState> = {
            views: {
                rhs: {
                    isSidebarOpen: true,
                    isSidebarExpanded: false,
                    rhsFocusIntent: null,
                },
                rhsSuppressed: false,
            },
        };

        renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={false}
            />,
            initialState,
        );

        expect(mockFocus).toHaveBeenCalled();
    });

    it('should NOT focus main textbox on mount when rhsFocusIntent exists (RHS wants focus)', () => {
        const initialState: DeepPartial<GlobalState> = {
            views: {
                rhs: {
                    isSidebarOpen: true,
                    isSidebarExpanded: false,
                    rhsFocusIntent: {target: 'textbox', requestId: 'test-123'},
                },
                rhsSuppressed: false,
            },
        };

        renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={false}
            />,
            initialState,
        );

        expect(mockFocus).not.toHaveBeenCalled();
    });

    it('should focus RHS textbox on mount when rhsFocusIntent targets textbox', () => {
        const initialState: DeepPartial<GlobalState> = {
            views: {
                rhs: {
                    isSidebarOpen: true,
                    isSidebarExpanded: false,
                    rhsFocusIntent: {target: 'textbox', requestId: 'test-123'},
                },
                rhsSuppressed: false,
            },
        };

        renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={true}
            />,
            initialState,
        );

        expect(mockFocus).toHaveBeenCalled();
    });

    it('should focus main textbox when rhsSuppressed goes from true to false (leaving Threads page)', () => {
        const initialState: DeepPartial<GlobalState> = {
            views: {
                rhs: {
                    isSidebarOpen: true,
                    isSidebarExpanded: false,
                    rhsFocusIntent: null,
                },
                rhsSuppressed: true,
            },
        };

        const {updateStoreState} = renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={false}
            />,
            initialState,
        );

        mockFocus.mockClear();

        updateStoreState({
            views: {
                rhsSuppressed: false,
            },
        });

        expect(mockFocus).toHaveBeenCalled();
    });

    it('should NOT focus RHS textbox when rhsSuppressed goes from true to false', () => {
        const initialState: DeepPartial<GlobalState> = {
            views: {
                rhs: {
                    isSidebarOpen: true,
                    isSidebarExpanded: false,
                    rhsFocusIntent: null,
                },
                rhsSuppressed: true,
            },
        };

        const {updateStoreState} = renderWithContext(
            <TestComponent
                channelId='channel_1'
                isRHS={true}
            />,
            initialState,
        );

        mockFocus.mockClear();

        updateStoreState({
            views: {
                rhsSuppressed: false,
            },
        });

        expect(mockFocus).not.toHaveBeenCalled();
    });
});
