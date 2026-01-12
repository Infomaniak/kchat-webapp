export type Transcript = {
    text: string;
};
export type TranscriptData = {
    segments: Array<{
        text: string;
        start: number;
    }>;
    text?: string;
};
