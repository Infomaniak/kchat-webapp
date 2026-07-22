import {useEffect, useRef, useState} from 'react';

export function useWebComponent<T extends HTMLElement>(tagName: string) {
    const ref = useRef<T | null>(null);
    const [isReady, setIsReady] = useState(() => Boolean(customElements.get(tagName)));

    useEffect(() => {
        let cancelled = false;
        if (!isReady) {
            customElements.whenDefined(tagName).then(() => {
                if (!cancelled) {
                    setIsReady(true);
                }
            });
        }
        return () => {
            cancelled = true;
        };
    }, [isReady, tagName]);

    return {ref, isReady};
}
