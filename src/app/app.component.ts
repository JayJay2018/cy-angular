import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './user/auth.service';
import {CompareService } from './compare/compare.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;

  constructor(private authService: AuthService,
              private router: Router,
              private compareService: CompareService) {
  }

  ngOnInit() {
    this.authService.authStatusChanged.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;
        if (authenticated) {
          this.router.navigate(['/compare']);
        } else {
          this.router.navigate(['/']);
        }
      }
    );
    this.authService.initAuth();
  }

  onLogout() {
    this.authService.logout();
  }

  onPostSlack() {
    this.compareService.onSlackPost();
  }
}
