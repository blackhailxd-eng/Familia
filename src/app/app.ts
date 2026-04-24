import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthService } from './auth.service';
import { GoogleIdentityService } from './google-identity.service';
import { Integrante } from './integrante';
import { IntegranteService } from './integrante.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit {
  private readonly integranteService = inject(IntegranteService);
  private readonly authService = inject(AuthService);
  private readonly googleIdentityService = inject(GoogleIdentityService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('googleButtonHost')
  private googleButtonHost?: ElementRef<HTMLDivElement>;

  protected readonly integrantes = signal<Integrante[]>([]);
  protected readonly cargando = signal(false);
  protected readonly authCargando = signal(false);
  protected readonly autenticando = signal(false);
  protected readonly apiError = signal('');
  protected readonly authError = signal('');
  protected readonly totalIntegrantes = computed(() => this.integrantes().length);
  protected readonly modoCaptura = 'Solo lectura';
  protected readonly usuario = this.authService.user;
  protected readonly autenticado = this.authService.isAuthenticated;
  protected readonly apiStatus = computed(() =>
    !this.autenticado()
      ? 'Inicia sesion para ver la tabla'
      : this.apiError()
        ? 'API sin conexion'
        : 'Sesion activa',
  );

  ngOnInit(): void {
    if (this.isBrowser) {
      this.restaurarSesion();
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.inicializarGoogleIdentity();
    }
  }

  protected cerrarSesion(): void {
    this.authError.set('');
    this.apiError.set('');

    this.authService.logout().subscribe(() => {
      this.integrantes.set([]);
      this.googleIdentityService.disableAutoSelect();
      queueMicrotask(() => this.renderizarBotonGoogle());
    });
  }

  private restaurarSesion(): void {
    this.authCargando.set(true);
    this.authError.set('');

    this.authService
      .restoreSession()
      .pipe(finalize(() => this.authCargando.set(false)))
      .subscribe({
        next: (usuario) => {
          if (usuario) {
            this.cargarIntegrantes();
          }
        },
      });
  }

  private inicializarGoogleIdentity(): void {
    if (!this.googleIdentityService.isConfigured()) {
      return;
    }

    this.googleIdentityService
      .load()
      .then(() => {
        this.googleIdentityService.initialize((credential) =>
          this.iniciarSesionConGoogle(credential),
        );
        this.renderizarBotonGoogle();
      })
      .catch(() => {
        this.authError.set('No se pudo cargar el inicio de sesion con Google.');
      });
  }

  private renderizarBotonGoogle(): void {
    const container = this.googleButtonHost?.nativeElement;

    if (!container || this.autenticado()) {
      return;
    }

    this.googleIdentityService.renderButton(container);
  }

  private iniciarSesionConGoogle(credential: string): void {
    this.autenticando.set(true);
    this.authError.set('');
    this.apiError.set('');

    this.authService
      .loginWithGoogleCredential(credential)
      .pipe(finalize(() => this.autenticando.set(false)))
      .subscribe({
        next: () => {
          this.cargarIntegrantes();
        },
        error: (error: HttpErrorResponse) => {
          this.authError.set(
            this.extraerMensajeError(
              error,
              'No fue posible completar el login con Google.',
            ),
          );
        },
      });
  }

  private cargarIntegrantes(): void {
    if (!this.autenticado()) {
      this.integrantes.set([]);
      return;
    }

    this.cargando.set(true);
    this.apiError.set('');

    this.integranteService
      .listarIntegrantes()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (integrantes) => {
          this.integrantes.set(integrantes ?? []);
          this.apiError.set('');
        },
        error: (_error: HttpErrorResponse) => {
          this.apiError.set('No fue posible cargar los integrantes desde la API.');
        },
      });
  }

  private extraerMensajeError(error: HttpErrorResponse, fallback: string): string {
    if (
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error &&
      typeof error.error.message === 'string' &&
      error.error.message.trim()
    ) {
      return error.error.message;
    }

    return fallback;
  }
}
