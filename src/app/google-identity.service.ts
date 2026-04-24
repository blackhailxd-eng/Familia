import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleIdentityService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private scriptLoadingPromise?: Promise<void>;

  isConfigured(): boolean {
    return Boolean(environment.googleClientId);
  }

  load(): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }

    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services.'));
      this.document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  initialize(onCredential: (credential: string) => void): void {
    if (!this.isConfigured()) {
      throw new Error('Falta configurar el Client ID de Google.');
    }

    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services todavia no esta disponible.');
    }

    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: ({ credential }) => {
        if (credential) {
          onCredential(credential);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  renderButton(container: HTMLElement): void {
    if (!window.google?.accounts?.id) {
      return;
    }

    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'signin_with',
      logo_alignment: 'left',
      width: 300,
    });
  }

  disableAutoSelect(): void {
    window.google?.accounts?.id.disableAutoSelect();
  }
}
