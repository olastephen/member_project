export interface User {
    id: string;
    avatar?: string;
    name: string;
    email: string;
    company?: string;
    agreements?: string;
    confirmation_token?: string;
    confirmed?: boolean;
    created_at?: string;
}

export interface LoginLog {
    id: string;
    user_id: string;
    login_time: string;
    ip_address: string;
    success: boolean;
}

export interface UnlockSession {
    id: string;
    user_id: string;
    unlock_time: string;
    ip_address: string;
    success: boolean;
}

export interface Session {
    id: string;
    user_id: string;
    session_time: string;
    ip_address: string;
    success: boolean;
}

export interface SocialAccount {
    id: string;
    user_id: string;
    provider: string;
    email: string;
}

export interface PrivacySettings {
    setting1: boolean;
    setting2: boolean;
}
