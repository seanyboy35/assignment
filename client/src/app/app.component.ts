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
  userRole: string = ''; // Added to manage user roles

  groups: string[] = []; // Array to store created groups
  channels: string[] = []; // Array to store created channels

  navigateTo(section: string) {
    this.currentSection = section;
  }

  login() {
    if (this.username === 'super' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'superAdmin'; // Set role for Super Admin
      this.loginError = null;
      this.navigateTo('home'); // Redirect to home after successful login
    } else if (this.username === 'groupAdmin' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'groupAdmin'; // Set role for Group Admin
      this.loginError = null;
      this.navigateTo('home'); // Redirect to home after successful login
    } else if (this.username === 'chatUser' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'chatUser'; // Set role for Chat User
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
    this.userRole = ''; // Reset user role on logout
    this.navigateTo('home'); // Redirect to home after logout
  }

  // Group Management functions
  createGroup() {
    const newGroupName = `Group ${this.groups.length + 1}`;
    this.groups.push(newGroupName);
    console.log('Creating group...', newGroupName);
  }

  createChannel() {
    const newChannelName = `Channel ${this.channels.length + 1}`;
    this.channels.push(newChannelName);
    console.log('Creating channel...', newChannelName);
  }

  removeGroup() {
    if (this.groups.length > 0) {
      const removedGroup = this.groups.pop(); // Remove the last group
      console.log('Removing group...', removedGroup);
    } else {
      console.log('No groups to remove.');
    }
  }

  removeChannel() {
    if (this.channels.length > 0) {
      const removedChannel = this.channels.pop(); // Remove the last channel
      console.log('Removing channel...', removedChannel);
    } else {
      console.log('No channels to remove.');
    }
  }

  // User Management functions
  createUser() {
    console.log('Creating user...');
  }

  deleteUser() {
    console.log('Deleting user...');
  }

  promoteUser() {
    console.log('Promoting user...');
  }

  // Chat User functions
  joinChannel() {
    console.log('Joining channel...');
  }

  leaveGroup() {
    console.log('Leaving group...');
  }
}
