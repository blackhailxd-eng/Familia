import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  if (!request.url.startsWith(environment.apiUrl)) {
    return next(request);
  }

  if (request.url === `${environment.apiUrl}/auth/google`) {
    return next(request);
  }

  const accessToken = authService.getAccessToken();

  if (!accessToken) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
};
