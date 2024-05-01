
export type ConferenceUserStatus = 'denied' | 'granted' | 'pending'

export type Registrant = { id: string; status: ConferenceUserStatus }

export type Conference = {
    url: string;
    id: string;
    channel_id: string;
    participants: string[];
    registrants: Record<string, Registrant>;
    user_id: string;
    create_at: number;
    jwt: string;
}
