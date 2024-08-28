// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoChatComponent } from './video-chat/video-chat.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { GroupManagementComponent } from './group-management/group-management.component';
import { ChatComponent } from './chat/chat.component'; // Import the Chat Component

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, VideoChatComponent, UserManagementComponent, GroupManagementComponent, ChatComponent], // Add ChatComponent to imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'My Application';
  companyName: string = 'Your Company Name';
  currentSection: string = 'home';

  navigateTo(section: string) {
    this.currentSection = section;
  }
}