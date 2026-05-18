
export type ConferenceUserStatus = 'denied' | 'approved' | 'pending'

export type Registrant = { id: string; status: ConferenceUserStatus; present: boolean }

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

export type IkCallUser = {
    nickname: string;
    [key: string]: any;
};

export type IkCallInfo = {
    users: IkCallUser[];
    caller: IkCallUser;
    currentUser: IkCallUser;
    channelId: string;
    url: string;
    avatar: string;
    id: string;
    nicknames: string;
    toneTimeOut: number;
}
