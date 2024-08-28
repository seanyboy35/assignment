// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule to use ngModel
import { VideoChatComponent } from './video-chat/video-chat.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { GroupManagementComponent } from './group-management/group-management.component';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule here
    VideoChatComponent,
    UserManagementComponent,
    GroupManagementComponent,
    ChatComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'My Application';
  companyName: string = 'Your Company Name';
  currentSection: string = 'home';
  isAuthenticated: boolean = false;
  username: string = '';
  password: string = '';
  loginError: string | null = null;

  navigateTo(section: string) {
    this.currentSection = section;
  }

  login() {
    if (this.username === 'super' && this.password === '123') {
      this.isAuthenticated = true;
      this.loginError = null;
      this.navigateTo('home'); // Redirect to home after successful login
    } else {
      this.loginError = 'Invalid username or password. Please try again.';
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.username = '';
    this.password = '';
    this.navigateTo('home'); // Redirect to home after logout
  }
}