import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(user => AuthActions.loginSuccess({ user })),
          catchError(error => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ user, password }) =>
        this.authService.register({
          email: user.email!,
          firstName: user.firstName!,
          lastName: user.lastName!,
          password,
          address: user.address!,
          city: user.city!,
          postalCode: user.postalCode!,
          phone: user.phone!,
          birthDate: user.birthDate!,
          profileImage: user.profileImage
        }).pipe(
          map(newUser => AuthActions.registerSuccess({ user: newUser })),
          catchError(error => of(AuthActions.registerFailure({ error: error.message })))
        )
      )
    )
  );

  authSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/home']))
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}
} 