export type Conference = {
    url: string;
    id: string;
    channel_id: string;
    participants: string[];
    user_id: string;
    create_at: number;
    joined?: string[];
    refused?: string[];
}
