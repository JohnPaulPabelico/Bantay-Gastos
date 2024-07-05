import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { UserService } from '../shared/user.service';
import { AuthService } from '../shared/auth.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent {
  constructor(
    private userService: UserService,
    private auth: AuthService,
    private storage: AngularFireStorage
  ) {}
  @Output() toggleEditProfile = new EventEmitter<void>();
  @Input() displayName: string | undefined;
  @ViewChild('expenseForm') editProfileForm!: NgForm;

  uid: string | undefined;
  userData: any[] = [];
  imageUrl: string | null = null;
  uploadError: string | null = null;
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadImage() {
    if (!this.selectedFile) {
      this.uploadError = 'No file selected.';
      return;
    }

    const filePath = `user_images/${this.selectedFile.name}`;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, this.selectedFile);

    uploadTask
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.imageUrl = url;
            // Save imageURL to user's data in Firestore or elsewhere
            // Example: this.userService.updateUserImage(userId, url);
          });
        })
      )
      .subscribe(null, (error) => {
        this.uploadError = 'Error uploading image: ' + error;
      });
  }

  ngOnInit() {
    this.uid = this.auth.getUserId();
    console.log('User ID: ' + this.uid);
    if (!this.uid) {
      console.error('Not currently signed in');
      return;
    }
  }

  onButtonClick() {
    this.toggleEditProfile.emit();
  }

  updateInformation(form: NgForm) {
    console.log(form.value);

    const userData: any = {
      displayName: form.value.displayName,
    };
    this.userService
      .createUser(this.uid, userData)
      .then(() => {
        form.reset();
        Swal.fire({
          title: 'Name updated!',
          icon: 'success',
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
      });
  }
}
