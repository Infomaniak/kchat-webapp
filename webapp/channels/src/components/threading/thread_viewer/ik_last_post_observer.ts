type ObserverCallback = (fullyInvisible: boolean) => void;

export class LastPostObserver {
    private observer: IntersectionObserver | null = null;
    private previousElement: HTMLElement | null = null;
    private callback: ObserverCallback;

    constructor(callback: ObserverCallback) {
        this.callback = callback;
    }

    observe(element: HTMLElement | null) {
        if (!element) {
            return;
        }

        if (this.previousElement && this.previousElement !== element && this.observer) {
            this.observer.unobserve(this.previousElement);
        }

        this.previousElement = element;

        if (!this.observer) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        this.callback(entry.intersectionRatio === 0);
                    });
                },
                {threshold: [0, 1]},
            );
        }

        this.observer.observe(element);
    }

    clear() {
        if (this.observer) {
            if (this.previousElement) {
                this.observer.unobserve(this.previousElement);
            }
            this.observer.disconnect();
            this.observer = null;
            this.previousElement = null;
        }
    }
}
