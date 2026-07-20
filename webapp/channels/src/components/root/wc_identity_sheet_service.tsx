import React, {useCallback, useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import {isAnyModalOpen} from 'selectors/views/modals';

export interface TeamIdentityConfig {
    accountId: number;
    entityId: number;
    displayName?: string;
    teamIcon?: string;
    teamColor?: number;
}

export interface WcIdentitySheetElement extends HTMLElement {
    open(options?: {mode: 'click' | 'hover'}): Promise<void>;
    close(options?: {animated?: boolean}): Promise<void>;
    entityType: string;
    entityId?: number;
    accountId?: number;
    displayName?: string;
    teamIcon?: string;
    teamColor?: number;
    customTrigger?: HTMLElement;
    hideDefaultSlot: boolean;
}

let showFn: ((config: TeamIdentityConfig, trigger: HTMLElement) => void) | null = null;

export function showTeamIdentitySheet(config: TeamIdentityConfig, trigger: HTMLElement) {
    showFn?.(config, trigger);
}

export function WcIdentitySheetService() {
    const sheetRef = useRef<WcIdentitySheetElement | null>(null);
    const anyModalOpen = useSelector(isAnyModalOpen);

    const handleShow = useCallback((newConfig: TeamIdentityConfig, trigger: HTMLElement) => {
        requestAnimationFrame(() => {
            const el = sheetRef.current;
            if (!el) {
                // eslint-disable-next-line no-console
                console.warn('WcIdentitySheetService: element not ready');
                return;
            }

            el.entityType = 'team';
            el.entityId = newConfig.entityId;
            el.accountId = newConfig.accountId;
            el.displayName = newConfig.displayName;
            el.teamIcon = newConfig.teamIcon;
            el.teamColor = newConfig.teamColor;
            el.customTrigger = trigger;
            el.open({mode: 'click'}).catch((err) => {
                // eslint-disable-next-line no-console
                console.error('WcIdentitySheetService: failed to open sheet', err);
            });
        });
    }, []);

    const showRef = useRef(handleShow);
    showRef.current = handleShow;

    useEffect(() => {
        showFn = (config, trigger) => showRef.current(config, trigger);
        return () => {
            showFn = null;
        };
    }, []);

    useEffect(() => {
        if (anyModalOpen) {
            sheetRef.current?.close().catch(() => { /* ignore */ });
        }
    }, [anyModalOpen]);

    return (
        <div style={{position: 'absolute', left: '-9999px', pointerEvents: 'none'}}>
            <wc-identity-sheet
                ref={sheetRef}
                entity-type={'team'}
                hide-default-slot={true}
                prevent-open-on-hover={true}
                prevent-stop-propagation={true}
                size={'md'}
            />
        </div>
    );
}
