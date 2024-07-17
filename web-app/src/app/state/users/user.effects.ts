import { UserService } from 'src/app/shared/user.service';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UserActions from './user.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

@Injectable()
export class UserEffects {
  constructor(private actions$: Actions, private userService: UserService) {}

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUser),
      mergeMap(({ uid }) =>
        this.userService.readUser(uid).pipe(
          map((user) => UserActions.loadUserSuccess({ user })),
          catchError((error) =>
            of(UserActions.loadUserFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.addUser),
      mergeMap((action) =>
        this.userService
          .createUser(action.userId, action.userData)
          .then(() => UserActions.addUserSuccess({ user: action.userData }))
          .catch((error) => of(UserActions.addUserFailure({ error })))
      )
    )
  );
}
