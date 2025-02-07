import { createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuth = (state: { auth: AuthState }) => state.auth;

export const selectAuthUser = createSelector(
  selectAuth,
  (auth) => auth.user
);

export const selectAuthLoading = createSelector(
  selectAuth,
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  selectAuth,
  (auth) => auth.error
); 