import {TitleChangeMessageKey} from '@infomaniak/ksuite-bridge';
import {useCallback, useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import type {GlobalState} from '@mattermost/types/store';

import {getKSuiteBridge} from 'mattermost-redux/selectors/entities/ksuiteBridge';

import {isInIframe} from 'utils/url-ksuite-redirect';

export default function WithTitleObserver() {
    const ksuiteBridge = useSelector((state: GlobalState) => getKSuiteBridge(state));

    const oldTitle = useRef<string>(document.title);

    const handleTitleChanges: MutationCallback = useCallback((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const documentTitle = document.title;

                if (ksuiteBridge && documentTitle !== oldTitle.current) {
                    ksuiteBridge.sendMessage({type: TitleChangeMessageKey, title: documentTitle});

                    oldTitle.current = documentTitle;
                }
            }
        });
    }, [ksuiteBridge]);

    useEffect(() => {
        const title = document.querySelector('title');
        const titleObserver = new MutationObserver(handleTitleChanges);

        if (isInIframe() && title) {
            titleObserver.observe(title, {childList: true, subtree: true, characterData: true});
        }

        return () => {
            titleObserver.disconnect();
        };
    }, [handleTitleChanges]);

    return null;
}
