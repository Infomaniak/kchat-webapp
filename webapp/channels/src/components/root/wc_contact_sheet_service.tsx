import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {isAnyModalOpen} from 'selectors/views/modals';

import {getHistory} from 'utils/browser_history';
import {copyToClipboard} from 'utils/utils';

export interface ContactSheetConfig {
    accountId: number;
    badges: string[];
    customContent?: React.ReactNode;
    hideStatus?: boolean;
    isUserGuest: boolean;
    overwriteIcon?: string;
    overwriteName?: string;
    shouldDisplayMinimalPanel: boolean;
    src?: string;
    teamName?: string;
    user?: UserProfile;
    userStatus: string;
    username?: string;
    userId: string;
    returnFocus?: () => void;
}

export interface WcContactSheetElement extends HTMLElement {
    open(options?: {mode: 'click' | 'hover'}): Promise<void>;
    close(): Promise<void>;
    hiddenOptions: string[];
    hiddenInformations: string[];
    customTrigger: HTMLElement | null;
    accountId: number;
    isExternal: boolean;
    kChatTeamName: string;
    kChatUserName: string;
    presence: string | undefined;
    src: string | undefined;
    timezone: string | undefined;
    userId: string | number | undefined;
    userMail: string | undefined;
    userName: string | undefined;
}

let showFn: ((config: ContactSheetConfig, trigger: HTMLElement) => void) | null = null;

export function showContactSheet(config: ContactSheetConfig, trigger: HTMLElement) {
    showFn?.(config, trigger);
}

export function WcContactSheetService() {
    const sheetRef = useRef<WcContactSheetElement | null>(null);
    const latestConfig = useRef<ContactSheetConfig | null>(null);
    const [config, setConfig] = useState<ContactSheetConfig | null>(null);
    const anyModalOpen = useSelector(isAnyModalOpen);

    const handleShow = useCallback((newConfig: ContactSheetConfig, trigger: HTMLElement) => {
        latestConfig.current = newConfig;
        setConfig(newConfig);

        requestAnimationFrame(() => {
            const el = sheetRef.current;
            if (!el) {
                return;
            }

            el.accountId = newConfig.accountId;
            el.isExternal = newConfig.isUserGuest;
            el.kChatTeamName = newConfig.teamName ?? '';
            el.kChatUserName = newConfig.username ?? '';
            el.presence = newConfig.hideStatus ? undefined : newConfig.userStatus;
            el.src = newConfig.overwriteIcon || newConfig.src;
            el.timezone = newConfig.user?.timezone?.useAutomaticTimezone ? newConfig.user?.timezone.automaticTimezone : newConfig.user?.timezone?.manualTimezone;
            el.userId = newConfig.shouldDisplayMinimalPanel ? undefined : newConfig.user?.user_id;
            el.userMail = newConfig.user?.is_bot ? `@${newConfig.username}` : newConfig.user?.email;
            el.userName = newConfig.overwriteName || [
                newConfig.user?.first_name,
                newConfig.user?.last_name,
            ].filter(Boolean).join(' ') || newConfig.username;

            if (newConfig.user?.is_bot) {
                el.hiddenInformations = ['userTimezone', 'email'];
                el.hiddenOptions = ['send-mail', 'search-incoming-mail', 'block-user', 'schedule-event', 'create-contact', 'show-contact', 'start-call', 'manage-profile'];
            } else {
                el.hiddenInformations = [];
                el.hiddenOptions = [];
            }

            el.customTrigger = trigger;
            el.open({mode: 'click'}).catch(() => { /* ignore */ });
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
        const el = sheetRef.current;
        if (!el) {
            return undefined;
        }

        const handleQuickActionClick = (e: CustomEvent) => {
            const {option} = e.detail;
            const values = latestConfig.current;

            if (values) {
                if (option.id === 'send-direct-message') {
                    getHistory().push(`/${values.teamName}/messages/@${values.username}`);
                    e.preventDefault();
                }
                if (option.id === 'start-call') {
                    getHistory().push(`/${values.teamName}/messages/@${values.user?.username}?call=true`);
                    e.preventDefault();
                }
                if (option.id === 'copy-kchat-user-id') {
                    copyToClipboard(values.userId);
                    e.preventDefault();
                }
            }
        };

        const handleClose = () => latestConfig.current?.returnFocus?.();

        el.addEventListener('close', handleClose);
        el.addEventListener('quickActionClick', handleQuickActionClick as EventListenerOrEventListenerObject);

        return () => {
            el.removeEventListener('close', handleClose);
            el.removeEventListener('quickActionClick', handleQuickActionClick as EventListenerOrEventListenerObject);
        };
    }, []);

    useEffect(() => {
        if (anyModalOpen) {
            sheetRef.current?.close().catch(() => { /* ignore */ });
        }
    }, [anyModalOpen]);

    return (
        <div style={{position: 'absolute', left: '-9999px', pointerEvents: 'none'}}>
            <wc-contact-sheet
                ref={sheetRef}
                prevent-open-on-hover={true}
                prevent-stop-propagation={true}
                size={'md'}
                background-color={'transparent'}
            >
                {config?.badges.map((badge, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <wc-pill
                        key={idx}
                        slot='custom-badges'
                        style={{
                            color: 'var(--wc-contact-sheet-pill-color)',
                            '--wc-pill-background': 'var(--wc-contact-sheet-pill-background-color)',
                        } as React.CSSProperties}
                        size='small'
                        round={true}
                        prevent-removal={true}
                    >
                        {badge}
                    </wc-pill>
                ))}
                {config?.customContent}
            </wc-contact-sheet>
        </div>
    );
}
