import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contact.sevice';
import { Contact } from '../../../shared/models/auth';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatDialogModule,
  ],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit {
  contacts = new MatTableDataSource<Contact>();
  filters!: FormGroup;
  page = 1;
  totalPages = 1;

  editedContact: Contact = {
    name: '',
    phone: '',
    address: '',
    notes: '',
  };

  dialogRef!: MatDialogRef<any>;

  @ViewChild('editDialog') editDialogTemplate!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.filters = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    const f = this.filters.value;
    this.contactService.getContacts(this.page, f).subscribe((res: any) => {
      this.contacts.data = res.data.Contacts;
      this.totalPages = res.data.pagination.pages;
    });
  }

  addContact() {
    if (this.filters.invalid) {
      alert('Please fill in all fields');
      return;
    }

    this.contactService.addContact(this.filters.value).subscribe({
      next: () => {
        alert('Contact added');
        this.filters.reset();
        this.loadContacts();
      },
      error: (err) => {
        alert(err.error?.errors[0]?.msg || 'Error adding contact');
      },
    });
  }

  edit(contact: Contact) {
    this.editedContact = { ...contact };
    this.dialogRef = this.dialog.open(this.editDialogTemplate);
  }

  updateContact() {
    if (!this.editedContact._id) return;

    this.contactService
      .updateContact(this.editedContact._id, this.editedContact)
      .subscribe({
        next: () => {
          this.dialogRef.close();
          this.loadContacts();
        },
        error: (e) => alert(e.error.message),
      });
  }

  delete(id: string) {
    if (!confirm('Are you sure , you want to delete this contact ?')) return;
    this.contactService.deleteContact(id).subscribe({
      next: () => this.loadContacts(),
      error: () => alert('Delete failed'),
    });
  }

  onFilterSubmit() {
    this.page = 1;
    this.loadContacts();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadContacts();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadContacts();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
