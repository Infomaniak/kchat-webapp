export type Conference = {

    url: string;
    id: string;
    channel_id: string;
    participants: string[];
    registrants: Record<string, { id: string; status: string }>;
    user_id: string;
    create_at: number;
    jwt: string;
}
