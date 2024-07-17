import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IncomeService } from 'src/app/shared/income.service';
import * as IncomeActions from './income.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

@Injectable()
export class IncomeEffects {
  constructor(
    private actions$: Actions,
    private incomeService: IncomeService
  ) {}

  loadIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.loadIncome),
      mergeMap(({ uid }) =>
        this.incomeService.readIncome(uid).pipe(
          map((income) => IncomeActions.loadIncomeSuccess({ income })),
          catchError((error) =>
            of(IncomeActions.loadIncomeFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.addIncome),
      mergeMap(({ income }) =>
        from(this.incomeService.createIncome(income)).pipe(
          map((docRef) => {
            const newIncome = { ...income, id: docRef.id };
            return IncomeActions.addIncomeSuccess({ income: newIncome });
          }),
          catchError((error) =>
            of(IncomeActions.addIncomeFailure({ error }))
          )
        )
      )
    )
  );

  deleteIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.deleteIncome),
      mergeMap(({ id }) =>
        from(this.incomeService.deleteIncome(id)).pipe(
          map(() => IncomeActions.deleteIncomeSuccess({ id })),
          catchError((error) =>
            of(IncomeActions.deleteIncomeFailure({ error }))
          )
        )
      )
    )
  );
}
