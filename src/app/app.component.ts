// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'urban-front';
  message: string | null = null;
  messageType: 'success' | 'error' | 'info' = 'info';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.message$.subscribe(({ message, type }) => {
      this.message = message;
      this.messageType = type;
      if (message) {
        setTimeout(() => {
          this.message = null;
        }, 5000);
      }
    });

  }
}
