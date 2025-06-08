import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  form!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: [''],
      password: [''],
    });
  }

  login() {
    if (this.form.invalid) return;
    console.log(this.auth.getToken());
    this.auth.login(this.form.value).subscribe({
      next: (res: any) => {
        this.auth.saveToken(res.data.token);
        this.router.navigate(['/contacts']);
      },
      error: () => alert('Invalid credentials'),
    });
  }
}
