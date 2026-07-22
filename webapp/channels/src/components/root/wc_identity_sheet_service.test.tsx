import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';

import {showTeamIdentitySheet, WcIdentitySheetService} from './wc_identity_sheet_service';

describe('WcIdentitySheetService', () => {
    const mockOpen = jest.fn().mockResolvedValue(undefined);
    const mockClose = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        jest.clearAllMocks();

        if (!customElements.get('wc-identity-sheet')) {
            customElements.define('wc-identity-sheet', class extends HTMLElement {});
        }
    });

    test('should render wc-identity-sheet element', () => {
        renderWithContext(<WcIdentitySheetService/>);
        const sheet = document.querySelector('wc-identity-sheet');
        expect(sheet).toBeInTheDocument();
    });

    test('showTeamIdentitySheet should set props and call open on the sheet', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);

        renderWithContext(<WcIdentitySheetService/>);

        const sheet = document.querySelector('wc-identity-sheet') as HTMLElement & {open: jest.Mock; close: jest.Mock};
        if (sheet) {
            (sheet as any).open = mockOpen;
            (sheet as any).close = mockClose;
        }

        showTeamIdentitySheet({
            accountId: 42,
            entityId: 123,
            displayName: 'Test Group',
        }, trigger);

        // RAF is async, so we need to wait
        return new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const updatedSheet = document.querySelector('wc-identity-sheet') as any;
                    if (updatedSheet) {
                        expect(updatedSheet.entityId).toBe(123);
                        expect(updatedSheet.accountId).toBe(42);
                        expect(updatedSheet.displayName).toBe('Test Group');
                        expect(updatedSheet.customTrigger).toBe(trigger);
                        expect(mockOpen).toHaveBeenCalledWith({mode: 'click'});
                    }
                    document.body.removeChild(trigger);
                    resolve();
                });
            });
        });
    });
});
