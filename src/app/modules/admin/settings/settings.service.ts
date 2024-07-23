import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, LoginLog, UnlockSession, Session, SocialAccount, PrivacySettings } from './settings.types';

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private apiUrl = 'https://ebapi.dayotech.org/settings.php';

    constructor(private _httpClient: HttpClient) { }

    getUserById(userId: string): Observable<User> {
        return this._httpClient.get<User>(`${this.apiUrl}?action=getUserById&userId=${userId}`);
    }

    getLoginLogs(userId: string): Observable<LoginLog[]> {
        return this._httpClient.get<LoginLog[]>(`${this.apiUrl}?action=getLoginLogs&userId=${userId}`);
    }

    getUnlockSessions(userId: string): Observable<UnlockSession[]> {
        return this._httpClient.get<UnlockSession[]>(`${this.apiUrl}?action=getUnlockSessions&userId=${userId}`);
    }

    getSessions(userId: string): Observable<Session[]> {
        return this._httpClient.get<Session[]>(`${this.apiUrl}?action=getSessions&userId=${userId}`);
    }

    getSocialAccounts(userId: string): Observable<SocialAccount[]> {
        return this._httpClient.get<SocialAccount[]>(`${this.apiUrl}?action=getSocialAccounts&userId=${userId}`);
    }

    checkEmailVerified(userId: string): Observable<boolean> {
        return this._httpClient.get<boolean>(`${this.apiUrl}?action=checkEmailVerified&userId=${userId}`);
    }

    updateProfile(user: User): Observable<User> {
        return this._httpClient.post<User>(`${this.apiUrl}?action=updateProfile`, user);
    }

    resetPassword(userId: string, oldPassword: string, newPassword: string): Observable<void> {
        return this._httpClient.post<void>(`${this.apiUrl}?action=resetPassword`, { userId, oldPassword, newPassword });
    }

    changeEmail(userId: string, newEmail: string): Observable<void> {
        return this._httpClient.post<void>(`${this.apiUrl}?action=changeEmail`, { userId, newEmail });
    }

    toggleTwoFactor(userId: string, enabled: boolean): Observable<void> {
        return this._httpClient.post<void>(`${this.apiUrl}?action=toggleTwoFactor`, { userId, enabled });
    }

    updatePrivacySettings(userId: string, privacySettings: PrivacySettings): Observable<void> {
        return this._httpClient.post<void>(`${this.apiUrl}?action=updatePrivacySettings`, { userId, privacySettings });
    }

    revokeSession(userId: string, sessionId: string): Observable<void> {
        return this._httpClient.post<void>(`${this.apiUrl}?action=revokeSession`, { userId, sessionId });
    }

    linkSocialAccount(userId: string, provider: string, email: string): Observable<SocialAccount> {
        return this._httpClient.post<SocialAccount>(`${this.apiUrl}?action=linkSocialAccount`, { userId, provider, email });
    }

    unlinkSocialAccount(userId: string, accountId: string): Observable<void> {
        return this._httpClient.post<void>(`${this.apiUrl}?action=unlinkSocialAccount`, { userId, accountId });
    }

    deleteAccount(userId: string): Observable<void> {
        return this._httpClient.post<void>(`${this.apiUrl}?action=deleteAccount`, { userId });
    }
}
