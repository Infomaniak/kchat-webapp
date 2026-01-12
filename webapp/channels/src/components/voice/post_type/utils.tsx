import type {TranscriptData} from '@mattermost/types/transcript';

export function isValidTranscript(
    transcript: TranscriptData | null | undefined,
): transcript is TranscriptData & { text: string } {
    return (
        typeof transcript === 'object' &&
    transcript !== null &&
    typeof transcript.text === 'string' &&
    transcript.text.length > 0
    );
}
