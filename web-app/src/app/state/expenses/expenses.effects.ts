import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ExpenseService } from 'src/app/shared/expense.service';
import * as ExpensesActions from './expenses.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

@Injectable()
export class ExpensesEffects {
  constructor(
    private actions$: Actions,
    private expenseService: ExpenseService
  ) {}

  loadExpenses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpensesActions.loadExpenses),
      mergeMap(({ uid }) =>
        this.expenseService.readExpense(uid).pipe(
          map((expenses) => ExpensesActions.loadExpensesSuccess({ expenses })),
          catchError((error) =>
            of(ExpensesActions.loadExpensesFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpensesActions.addExpense),
      mergeMap(({ expense }) =>
        from(this.expenseService.createExpense(expense)).pipe(
          map((docRef) => {
            const newExpense = { ...expense, id: docRef.id };
            return ExpensesActions.addExpenseSuccess({ expense: newExpense });
          }),
          catchError((error) =>
            of(ExpensesActions.addExpenseFailure({ error }))
          )
        )
      )
    )
  );

  deleteExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpensesActions.deleteExpense),
      mergeMap(({ id }) =>
        from(this.expenseService.deleteExpense(id)).pipe(
          map(() => ExpensesActions.deleteExpenseSuccess({ id })),
          catchError((error) =>
            of(ExpensesActions.deleteExpenseFailure({ error }))
          )
        )
      )
    )
  );
}
