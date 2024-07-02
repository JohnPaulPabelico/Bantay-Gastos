import { Component, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { IncomeService } from 'src/app/shared/income.service';
import { Subject, takeUntil, tap, timestamp } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Income } from 'src/app/model/income';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss'],
})
export class IncomeComponent {
  @ViewChild('incomeForm') incomeForm!: NgForm; // Non-null assertion operator// Reference to the form
  constructor(
    private auth: AuthService,
    private incomeService: IncomeService,
    private firestore: AngularFirestore
  ) {}

  incomeData: Income[] = [];
  totalAmount: number = 0; // Initialize totalAmount
  uid: string | undefined;

  private unsubscribe$ = new Subject<void>();
  isLoading = false;
  isFilled = false;
  isEmpty = false;

  selectedValue: string = '';
  categories = [
    { value: 'Salary', viewValue: 'Salary' },
    { value: 'Cryptocurrency', viewValue: 'Cryptocurrency' },
    { value: 'Allowance', viewValue: 'Allowance' },
    { value: 'Business', viewValue: 'Business' },
    { value: 'Gifts', viewValue: 'Gifts' },
  ];

  ngOnInit() {
    this.uid = this.auth.getUserId();
    console.log('User ID: ' + this.uid);
    if (!this.uid) {
      console.error('Not currently signed in');
      return;
    }
    this.isFilled = true;
    this.getIncome();
  }

  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  logout() {
    this.auth.logout();
  }

  calculateTotalAmount() {
    this.totalAmount = this.incomeData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );
  }

  addIncome(form: NgForm) {
    this.isFilled = false;
    if (!this.uid) {
      console.error('Cannot add income, user ID not found');
      return;
    }

    const dateInt = new Date(form.value.date).getTime();
    const date = new Date(form.value.date);

    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    console.log(formattedDate); // Output: "Jun 06, 2024"

    const incomeData: any = {
      title: form.value.Title,
      amount: form.value.Amount,
      dateString: formattedDate,
      category: this.selectedValue,
      dateInt: dateInt,
      date: date,
      description: form.value.description,
      createdById: this.uid,
    };

    if (
      !incomeData.title ||
      !incomeData.amount ||
      !incomeData.date ||
      !incomeData.description ||
      !incomeData.category
    ) {
      this.isFilled = false;
      console.error('All fields are required');
      return;
    }
    this.isFilled = true;
    console.log('Filled in fields:', incomeData);

    this.incomeService
      .createIncome(incomeData)
      .then((docRef) => {
        // Update the document with the generated ID
        incomeData.id = docRef.id;

        // Update the document in Firestore with the generated ID
        form.reset();
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
      });
  }

  getIncome() {
    this.isLoading = true;
    if (!this.uid) {
      console.error('Cannot get income, user ID not found');
      return;
    }

    this.incomeService
      .readIncome(this.uid)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => console.log('income subscription unsubscribed'))
      )
      .subscribe(
        (income: any[]) => {
          this.isLoading = false;
          this.incomeData = income;
          this.isEmpty = income.length === 0;
          console.log('Fetched income:', this.incomeData);
          this.calculateTotalAmount();
        },
        (error) => {
          console.error('Error fetching income:', error);
        }
      );
  }

  deleteIncome(id: string) {
    if (!id) {
      console.error('Cannot delete expense without ID');
      return;
    }

    this.firestore
      .collection('income')
      .doc(id)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
        this.incomeData = this.incomeData.filter((income) => income.id !== id);
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  }
}
