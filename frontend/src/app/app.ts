import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NgIf } from '@angular/common';
import { Login } from './components/login/login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'frontend';
  constructor(public authService: AuthService) {
    // afterNextRender(() => {
    //   this.showLogin = !this.authService.isLoggedIn();
    // });
  }
}
