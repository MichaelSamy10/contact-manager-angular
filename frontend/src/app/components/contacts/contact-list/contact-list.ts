import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContactService } from '../contact.sevice';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Contact } from '../../../shared/models/auth';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-list',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
  ],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit {
  contacts = new MatTableDataSource<Contact>();
  successMessage = '';
  errorMessage = '';
  page = 1;
  filters!: FormGroup;
  totalPages = 1;
  constructor(
    private contactService: ContactService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router
  ) {
    this.filters = this.fb.group({
      name: ['', Validators.required, Validators.minLength(2)],
      phone: ['', Validators.required],
      address: ['', Validators.required, Validators.minLength(5)],
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

      this.cd.detectChanges();
    });
  }

  addContact() {
    const name = this.filters.get('name')?.value;
    const phone = this.filters.get('phone')?.value;
    const address = this.filters.get('address')?.value;
    const notes = this.filters.get('notes')?.value;

    if (this.filters.invalid) {
      this.errorMessage = 'Please fill in all fields before adding a contact.';
      alert(this.errorMessage);
      return;
    }

    this.contactService
      .addContact({
        name,
        phone,
        address,
        notes,
      })
      .subscribe({
        next: (res) => {
          console.log('Contact created:', res);
          this.successMessage = res.message!;
          alert(this.successMessage);
          this.filters.reset();
          this.loadContacts();
        },
        error: (err) => {
          console.error('Error creating contact:', err);
          this.errorMessage = err.error?.message!;
          this.filters.reset();
          alert(this.errorMessage);
        },
      });
  }

  delete(id: string) {
    if (!confirm('Are you sure to delete contact?')) return;
    this.contactService.deleteContact(id).subscribe({
      next: (res) => {
        console.log('Contact deleted:', res);
        this.loadContacts();
      },
      error: (err) => {
        console.error('Error deleting contact:', err);
      },
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
      console.log(this.page);
    }
  }
  nextPage() {
    this.page++;
    this.loadContacts();
    console.log(this.page);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
