import React, {useCallback, useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import {isAnyModalOpen} from 'selectors/views/modals';

import {useWebComponent} from 'components/common/hooks/useWebComponent';

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
    if (showFn) {
        showFn(config, trigger);
    } else {
        // eslint-disable-next-line no-console
        console.warn('WcIdentitySheetService: not ready — cannot show team identity sheet');
    }
}

export function WcIdentitySheetService() {
    const {ref: sheetRef, isReady} = useWebComponent<WcIdentitySheetElement>('wc-identity-sheet');
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
    }, [sheetRef]);

    const showRef = useRef(handleShow);
    showRef.current = handleShow;

    useEffect(() => {
        if (isReady) {
            showFn = (config, trigger) => showRef.current(config, trigger);
        } else {
            showFn = null;
        }
        return () => {
            showFn = null;
        };
    }, [isReady]);

    useEffect(() => {
        if (anyModalOpen && isReady) {
            const el = sheetRef.current;
            if (el && typeof el.close === 'function') {
                el.close().catch((err) => {
                    // eslint-disable-next-line no-console
                    console.error('WcIdentitySheetService: failed to close sheet', err);
                });
            }
        }
    }, [anyModalOpen, isReady]);

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
