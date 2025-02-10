import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, take, tap, catchError } from 'rxjs/operators';
import { selectAuthUser } from '../store/auth/auth.selectors';
import { AuthState } from '../store/auth/auth.reducer';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private store: Store<{ auth: AuthState }>,
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      take(1),
      map(isLoggedIn => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAdmin().pipe(
      take(1),
      map(isAdmin => {
        if (!isAdmin) {
          this.router.navigate(['/home']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      take(1),
      map(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/home']);
          return false;
        }
        return true;
      }),
      catchError(() => of(true))
    );
  }
} 