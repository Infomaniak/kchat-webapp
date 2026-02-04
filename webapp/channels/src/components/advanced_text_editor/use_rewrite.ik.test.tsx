// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {RefObject} from 'react';
import React from 'react';

import type {DeepPartial} from '@mattermost/types/utilities';

import {Client4} from 'mattermost-redux/client';

import type {TextboxClass} from 'components/textbox';

import {renderWithContext} from 'tests/react_testing_utils';

import type {GlobalState} from 'types/store';
import type {PostDraft} from 'types/store/draft';

import {RewriteAction} from './rewrite_action';
import useRewrite from './use_rewrite';

jest.mock('mattermost-redux/client', () => {
    const original = jest.requireActual('mattermost-redux/client');
    return {
        ...original,
        Client4: {
            ...original.Client4,
            getAIRewrittenMessage: jest.fn(),
        },
    };
});

const mockGetAIRewrittenMessage = Client4.getAIRewrittenMessage as jest.Mock;

function createMockDraft(message = 'Hello world'): PostDraft {
    return {
        message,
        channelId: 'channel-id',
        rootId: '',
        fileInfos: [],
        uploadsInProgress: [],
        createAt: 0,
        updateAt: 0,
    };
}

function createMockTextboxRef(): RefObject<TextboxClass> {
    const mockInput = document.createElement('textarea');
    const mockWrapper = document.createElement('div');
    mockWrapper.appendChild(mockInput);
    document.body.appendChild(mockWrapper);

    return {
        current: {
            getInputBox: () => mockInput,
            focus: jest.fn(),
            blur: jest.fn(),
            getWrapperId: () => 'wrapper-id',
        } as unknown as TextboxClass,
    };
}

function getBaseState(): DeepPartial<GlobalState> {
    return {
        entities: {
            users: {
                currentUserId: 'current-user-id',
                profiles: {
                    'current-user-id': {
                        id: 'current-user-id',
                        username: 'testuser',
                    },
                },
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
            teams: {
                currentTeamId: 'team-id',
            },
        },
        views: {
            browser: {
                windowSize: 'desktop',
            },
        },
    };
}

interface TestComponentProps {
    draft: PostDraft;
    handleDraftChange: jest.Mock;
    focusTextbox: jest.Mock;
    setServerError: jest.Mock;
    textboxRef: RefObject<TextboxClass>;
    disabled?: boolean;
}

function TestComponent({
    draft,
    handleDraftChange,
    focusTextbox,
    setServerError,
    textboxRef,
    disabled,
}: TestComponentProps) {
    const {rewriteControl, isRewriting} = useRewrite({
        draft,
        handleDraftChange,
        focusTextbox,
        setServerError,
        textboxRef,
        disabled,
    });

    return (
        <div>
            <span data-testid='is-rewriting'>{String(isRewriting)}</span>
            {rewriteControl}
        </div>
    );
}

describe('useRewrite', () => {
    let mockHandleDraftChange: jest.Mock;
    let mockFocusTextbox: jest.Mock;
    let mockSetServerError: jest.Mock;
    let mockTextboxRef: RefObject<TextboxClass>;

    beforeEach(() => {
        mockHandleDraftChange = jest.fn();
        mockFocusTextbox = jest.fn();
        mockSetServerError = jest.fn();
        mockTextboxRef = createMockTextboxRef();
        mockGetAIRewrittenMessage.mockReset();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('initial state', () => {
        it('should return isRewriting false initially', () => {
            renderWithContext(
                <TestComponent
                    draft={createMockDraft()}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            expect(screen.getByTestId('is-rewriting').textContent).toBe('false');
        });

        it('should render rewrite menu button', () => {
            renderWithContext(
                <TestComponent
                    draft={createMockDraft()}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            expect(screen.getByRole('button', {name: /rewrite/i})).toBeInTheDocument();
        });
    });

    describe('handleRewrite', () => {
        it('should call API and update draft on successful rewrite', async () => {
            mockGetAIRewrittenMessage.mockResolvedValue('Improved message');

            const draft = createMockDraft('Original message');
            renderWithContext(
                <TestComponent
                    draft={draft}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            const rewriteButton = screen.getByRole('button', {name: /rewrite/i});
            userEvent.click(rewriteButton);

            const improveOption = await screen.findByText(/improve writing/i);
            userEvent.click(improveOption);

            await waitFor(() => {
                expect(mockGetAIRewrittenMessage).toHaveBeenCalledWith(
                    'Original message',
                    RewriteAction.IMPROVE_WRITING,
                    undefined,
                );
            });

            await waitFor(() => {
                expect(mockHandleDraftChange).toHaveBeenCalledWith({
                    ...draft,
                    message: 'Improved message',
                });
            });

            expect(mockFocusTextbox).toHaveBeenCalledWith(true);
        });

        it('should not call API when message is empty', () => {
            const draft = createMockDraft('');
            renderWithContext(
                <TestComponent
                    draft={draft}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            const rewriteButton = screen.getByRole('button', {name: /rewrite/i});
            expect(rewriteButton).toBeDisabled();

            expect(mockGetAIRewrittenMessage).not.toHaveBeenCalled();
            expect(mockHandleDraftChange).not.toHaveBeenCalled();
        });

        it('should set isRewriting to true during API call', async () => {
            let resolvePromise: (value: string) => void;
            mockGetAIRewrittenMessage.mockImplementation(() => new Promise((resolve) => {
                resolvePromise = resolve;
            }));

            renderWithContext(
                <TestComponent
                    draft={createMockDraft()}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            expect(screen.getByTestId('is-rewriting').textContent).toBe('false');

            const rewriteButton = screen.getByRole('button', {name: /rewrite/i});
            userEvent.click(rewriteButton);

            const improveOption = await screen.findByText(/improve writing/i);
            userEvent.click(improveOption);

            await waitFor(() => {
                expect(screen.getByTestId('is-rewriting').textContent).toBe('true');
            });

            resolvePromise!('Done');

            await waitFor(() => {
                expect(screen.getByTestId('is-rewriting').textContent).toBe('false');
            });
        });

        it('should call setServerError on API error', async () => {
            const testError = new Error('API Error');
            mockGetAIRewrittenMessage.mockRejectedValue(testError);

            renderWithContext(
                <TestComponent
                    draft={createMockDraft()}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            const rewriteButton = screen.getByRole('button', {name: /rewrite/i});
            userEvent.click(rewriteButton);

            const improveOption = await screen.findByText(/improve writing/i);
            userEvent.click(improveOption);

            await waitFor(() => {
                expect(mockSetServerError).toHaveBeenCalledWith(testError);
            });

            expect(mockHandleDraftChange).not.toHaveBeenCalled();
        });

        it('should not call setServerError on AbortError', async () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            mockGetAIRewrittenMessage.mockRejectedValue(abortError);

            renderWithContext(
                <TestComponent
                    draft={createMockDraft()}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            const rewriteButton = screen.getByRole('button', {name: /rewrite/i});
            userEvent.click(rewriteButton);

            const improveOption = await screen.findByText(/improve writing/i);
            userEvent.click(improveOption);

            await waitFor(() => {
                expect(mockGetAIRewrittenMessage).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(mockSetServerError).not.toHaveBeenCalled();
            }, {timeout: 1000});
        });
    });

    describe('abort functionality', () => {
        it('should not update draft when aborted before API resolves', async () => {
            let resolvePromise: (value: string) => void;
            mockGetAIRewrittenMessage.mockImplementation(() => new Promise((resolve) => {
                resolvePromise = resolve;
            }));

            renderWithContext(
                <TestComponent
                    draft={createMockDraft()}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            const rewriteButton = screen.getByRole('button', {name: /rewrite/i});
            userEvent.click(rewriteButton);

            const improveOption = await screen.findByText(/improve writing/i);
            userEvent.click(improveOption);

            await waitFor(() => {
                expect(screen.getByTestId('is-rewriting').textContent).toBe('true');
            });

            const stopButton = screen.getByRole('button', {name: /stop/i});
            userEvent.click(stopButton);

            expect(screen.getByTestId('is-rewriting').textContent).toBe('false');

            resolvePromise!('Should not be used');

            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(mockHandleDraftChange).not.toHaveBeenCalled();
        });

        it('should set isRewriting to false when stopped', async () => {
            mockGetAIRewrittenMessage.mockImplementation(() => new Promise(() => {}));

            renderWithContext(
                <TestComponent
                    draft={createMockDraft()}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            const rewriteButton = screen.getByRole('button', {name: /rewrite/i});
            userEvent.click(rewriteButton);

            const improveOption = await screen.findByText(/improve writing/i);
            userEvent.click(improveOption);

            await waitFor(() => {
                expect(screen.getByTestId('is-rewriting').textContent).toBe('true');
            });

            const stopButton = screen.getByRole('button', {name: /stop/i});
            userEvent.click(stopButton);

            expect(screen.getByTestId('is-rewriting').textContent).toBe('false');
        });
    });

    describe('disabled state', () => {
        it('should disable button when disabled prop is true', () => {
            renderWithContext(
                <TestComponent
                    draft={createMockDraft()}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                    disabled={true}
                />,
                getBaseState(),
            );

            expect(screen.getByRole('button', {name: /rewrite/i})).toBeDisabled();
        });

        it('should disable button when message is empty', () => {
            renderWithContext(
                <TestComponent
                    draft={createMockDraft('')}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                />,
                getBaseState(),
            );

            expect(screen.getByRole('button', {name: /rewrite/i})).toBeDisabled();
        });

        it('should enable button when message has content and not disabled', () => {
            renderWithContext(
                <TestComponent
                    draft={createMockDraft('Some content')}
                    handleDraftChange={mockHandleDraftChange}
                    focusTextbox={mockFocusTextbox}
                    setServerError={mockSetServerError}
                    textboxRef={mockTextboxRef}
                    disabled={false}
                />,
                getBaseState(),
            );

            expect(screen.getByRole('button', {name: /rewrite/i})).toBeEnabled();
        });
    });
});

describe('RewriteAction enum', () => {
    it('should have all expected rewrite actions', () => {
        expect(RewriteAction.SHORTEN).toBe('shorten');
        expect(RewriteAction.ELABORATE).toBe('elaborate');
        expect(RewriteAction.IMPROVE_WRITING).toBe('improve_writing');
        expect(RewriteAction.FIX_SPELLING).toBe('fix_spelling');
        expect(RewriteAction.SIMPLIFY).toBe('simplify');
        expect(RewriteAction.SUMMARIZE).toBe('summarize');
        expect(RewriteAction.CUSTOM).toBe('custom');
    });

    it('should have exactly 7 actions', () => {
        const actions = Object.values(RewriteAction);
        expect(actions).toHaveLength(7);
    });
});
