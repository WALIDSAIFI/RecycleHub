import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectAuthUser } from '../store/auth/auth.selectors';
import { AuthState } from '../store/auth/auth.reducer';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private store: Store<{ auth: AuthState }>,
    private router: Router
  ) {}

  canActivate() {
    return this.store.select(selectAuthUser).pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        }
        
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
} 