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

  // Updated to store groups and their associated channels
  groups: { name: string, channels: string[], members: string[], requests: string[] }[] = [];
  chatUser: { username: string, groups: string[] } | null = null; // Stores the chat user's info

  constructor() {
    this.initializeGroups(); // Initialize groups and other data
  }

  initializeGroups() {
    // Sample groups initialized for demonstration
    this.groups = [
      { name: 'Group 1', channels: ['Channel 1 of Group 1'], members: [], requests: [] },
      { name: 'Group 2', channels: ['Channel 1 of Group 2'], members: [], requests: [] }
    ];
  }

  navigateTo(section: string) {
    this.currentSection = section;
  }

  login() {
    if (this.username === 'super' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'superAdmin'; // Set role for Super Admin
      this.loginError = null;
      this.navigateTo('home'); // Redirect to home after successful login
    } else if (this.username === 'group' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'groupAdmin'; // Set role for Group Admin
      this.loginError = null;
      this.navigateTo('home'); // Redirect to home after successful login
    } else if (this.username === 'chat' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'chatUser'; // Set role for Chat User
      this.chatUser = { username: `ChatUser_${Math.floor(Math.random() * 1000)}`, groups: [] };
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
    this.chatUser = null; // Reset chat user info
    this.navigateTo('home'); // Redirect to home after logout
  }

  // Group Management functions
  createGroup() {
    const newGroupName = `Group ${this.groups.length + 1}`;
    this.groups.push({ name: newGroupName, channels: [], members: [], requests: [] });
    console.log('Creating group...', newGroupName);
  }

  createChannel(groupName: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      const newChannelName = `Channel ${group.channels.length + 1} of ${groupName}`;
      group.channels.push(newChannelName);
      console.log('Creating channel:', newChannelName);
    }
  }

  createUser() {
    // Logic to create a user
    console.log('Creating a new user...');
  }

  deleteUser() {
    // Logic to delete a user
    console.log('Deleting user...');
  }

  promoteUser() {
    // Logic to promote a user
    console.log('Promoting user...');
  }

  removeGroup(groupName: string) {
    this.groups = this.groups.filter(g => g.name !== groupName);
    console.log('Removing group:', groupName);
  }

  removeChannel(groupName: string, channelName: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      group.channels = group.channels.filter(c => c !== channelName);
      console.log('Removing channel:', channelName, 'from', groupName);
    }
  }

  // Chat User Functions
  joinGroupRequest(groupName: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group && this.chatUser) {
      group.requests.push(this.chatUser.username);
      console.log('Requesting to join group:', groupName);
    }
  }

  leaveGroup(groupName: string) {
  if (this.chatUser) {
    this.chatUser.groups = this.chatUser.groups.filter(g => g !== groupName);
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      group.members = group.members.filter(m => m !== this.chatUser?.username);
      console.log('Leaving group:', groupName);
    }
  }
}


  deleteAccount() {
    if (this.chatUser) {
      if (confirm('Are you sure you want to delete your account?')) {
        console.log('Deleting account for user:', this.chatUser.username);
        this.logout();
      } else {
        console.log('Account deletion cancelled.');
      }
    }
  }

  // Admin Functions to Approve/Deny Requests
  approveRequest(groupName: string, username: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      group.requests = group.requests.filter(r => r !== username);
      group.members.push(username);
      console.log('Approved request for user:', username, 'to join group:', groupName);
    }
  }

  denyRequest(groupName: string, username: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      group.requests = group.requests.filter(r => r !== username);
      console.log('Denied request for user:', username, 'to join group:', groupName);
    }
  }
}
