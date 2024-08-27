// src/app/app.component.ts
import { Component } from '@angular/core';
import { VideoChatComponent } from './video-chat/video-chat.component'; // Import VideoChatComponent
import { UserManagementComponent } from './user-management/user-management.component'; // Import UserManagementComponent
import { ChatComponent } from './chat/chat.component';
import { GroupManagementComponent } from './group-management/group-management.component';

@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  imports: [VideoChatComponent, UserManagementComponent, ChatComponent, GroupManagementComponent], // Add components to imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'My Application';

  // Define companyName property here
  companyName: string = 'Your Company Name';

  // Define navigation logic if needed
  currentSection: string = 'home'; // default section

  navigateTo(section: string) {
    this.currentSection = section;
  }
}