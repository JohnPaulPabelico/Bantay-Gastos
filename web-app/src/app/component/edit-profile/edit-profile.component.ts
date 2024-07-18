import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { UserService } from '../../shared/user.service';
import { AuthService } from '../../shared/auth.service';
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
  @Input() existingImageUrl: string | undefined;
  @Input() emailAddress: string | undefined;
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
            console.log('Image URL:', url);
            this.userService
              .createUser(this.uid, { imageUrl: url })
              .then(() => {
                this.uploadError = null;
              })
              .catch((error) => {
                console.error('Error writing document: ', error);
              });
          });
        })
      )
      .subscribe(null, (error) => {
        this.uploadError = 'Error uploading image: ' + error;
      });
  }

  openImageUpload() {
    Swal.fire({
      title: 'Change Profile Picture',
      html: `
      <label for="fileInput" style="cursor: pointer;">
        <img id="previewImage" src="assets/upload-image.webp" height="60" alt="Upload Image" style="border-radius: 50%; border: #000000 solid 1px; cursor: pointer;"/>
      </label>
    `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
      preConfirm: () => {
        if (!this.selectedFile) {
          Swal.showValidationMessage('Please select a file to upload.');
          return false;
        } else if (!this.isValidFileType(this.selectedFile.type)) {
          Swal.showValidationMessage('Only JPG and PNG files are allowed.');
          return false;
        }
        return true;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.uploadImage();
      }
    });

    // Add event listener to file input for preview functionality
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const previewImage = document.getElementById(
      'previewImage'
    ) as HTMLImageElement;

    fileInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && this.isValidFileType(file.type)) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            previewImage.src = reader.result;
          }
        };
        reader.readAsDataURL(file);
        this.selectedFile = file;
      } else {
        this.selectedFile = null;
        previewImage.src = 'assets/upload-image.webp';
        Swal.showValidationMessage('Only JPG and PNG files are allowed.');
      }
    });
  }

  isValidFileType(fileType: string): boolean {
    return (
      fileType === 'image/jpeg' ||
      fileType === 'image/png' ||
      fileType === 'image/jpg' ||
      fileType === 'image/webp'
    );
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
