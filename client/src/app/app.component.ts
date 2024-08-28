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
  userRole: 'superAdmin' | 'groupAdmin' | 'chatUser' | null = null;
  username: string = '';
  password: string = '';
  loginError: string | null = null;

  navigateTo(section: string) {
    this.currentSection = section;
  }

  login() {
    if (this.username === 'super' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'superAdmin';
      this.loginError = null;
    } else if (this.username === 'groupAdmin' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'groupAdmin';
      this.loginError = null;
    } else if (this.username === 'chatUser' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'chatUser';
      this.loginError = null;
    } else {
      this.loginError = 'Invalid username or password. Please try again.';
    }
    this.navigateTo('home'); // Redirect to home after successful login
  }

  logout() {
    this.isAuthenticated = false;
    this.userRole = null;
    this.username = '';
    this.password = '';
    this.navigateTo('home'); // Redirect to home after logout
  }

  // Super Admin methods
  createUser() {
    console.log('Create User clicked');
  }

  deleteUser() {
    console.log('Delete User clicked');
  }

  promoteUser() {
    console.log('Promote User clicked');
  }

  // Group Admin methods
  createGroup() {
    console.log('Create Group clicked');
  }

  createChannel() {
    console.log('Create Channel clicked');
  }

  removeGroup() {
    console.log('Remove Group clicked');
  }

  // Chat User methods
  joinChannel() {
    console.log('Join Channel clicked');
  }

  leaveGroup() {
    console.log('Leave Group clicked');
  }
}