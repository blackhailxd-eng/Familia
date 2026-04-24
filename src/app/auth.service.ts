import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../environments/environment';
import { AuthSession } from './auth-session';
import { AuthUser } from './auth-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageKey = 'api-familia.auth-session';
  private readonly authApiUrl = `${environment.apiUrl}/auth`;

  private readonly sessionState = signal<AuthSession | null>(this.readStoredSession());

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.sessionState()?.accessToken));

  restoreSession(): Observable<AuthUser | null> {
    const session = this.sessionState();

    if (!this.isBrowser || !session) {
      return of(null);
    }

    if (Date.parse(session.expiresAt) <= Date.now()) {
      this.clearSession();
      return of(null);
    }

    return this.http.get<AuthUser>(`${this.authApiUrl}/me`).pipe(
      tap((user) => {
        this.persistSession({ ...session, user });
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  loginWithGoogleCredential(credential: string): Observable<AuthSession> {
    return this.http
      .post<AuthSession>(`${this.authApiUrl}/google`, { credential })
      .pipe(tap((session) => this.persistSession(session)));
  }

  logout(): Observable<void> {
    if (!this.isAuthenticated()) {
      this.clearSession();
      return of(void 0);
    }

    return this.http.post<void>(`${this.authApiUrl}/logout`, {}).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => this.clearSession()),
    );
  }

  getAccessToken(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }

  clearSession(): void {
    this.sessionState.set(null);

    if (this.isBrowser) {
      localStorage.removeItem(this.storageKey);
    }
  }

  private persistSession(session: AuthSession): void {
    this.sessionState.set(session);

    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    }
  }

  private readStoredSession(): AuthSession | null {
    if (!this.isBrowser) {
      return null;
    }

    const rawSession = localStorage.getItem(this.storageKey);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
