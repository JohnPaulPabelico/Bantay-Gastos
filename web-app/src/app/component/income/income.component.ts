import { Component, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { IncomeService } from 'src/app/shared/income.service';
import { Subject, takeUntil, tap, timestamp } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Timestamp } from 'firebase/firestore';

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
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  incomeData: any[] = [];
  totalAmount: number = 0; // Initialize totalAmount
  uid: string | null = null;

  private unsubscribe$ = new Subject<void>();
  isLoading = false;
  isFilled = false;
  isEmpty = false;

  calculateTotalAmount() {
    this.totalAmount = this.incomeData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );
  }

  addIncome(form: NgForm) {
    this.isFilled = false;
    console.log('current UID:', this.uid);
    if (!this.uid) {
      console.error('Not currently signed in');
      return;
    }

    const dateInt = new Date(form.value.date).getTime();

    const firestoreTimestamp: Timestamp = Timestamp.fromDate(form.value.date);
    console.log('Firestore Timestamp:', firestoreTimestamp);
    const firestoreTimestampString = firestoreTimestamp.toDate().toString();

    const date = new Date(firestoreTimestampString);

    // Step 2: Format the date into "MMM DD YYYY" format
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
      dateInt: dateInt,
      date: date,
      description: form.value.description,
      createdById: this.uid,
    };

    if (
      !incomeData.title ||
      !incomeData.amount ||
      !incomeData.date ||
      !incomeData.description
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
    console.log('User ID: ' + this.uid);
    if (!this.uid) {
      console.error('Not currently signed ins');
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
    this.firestore
      .collection('incomes')
      .doc(id)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  }

  async getUserId() {
    try {
      const user = await this.fireAuth.currentUser;
      if (user) {
        this.uid = user.uid;
        console.log('User ID: ' + this.uid);
      } else {
        console.log('No user is currently signed in.');
      }
    } catch (error) {
      console.error('Error getting current user: ', error);
    }
  }

  async ngOnInit(): Promise<void> {
    await this.getUserId();
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
}
