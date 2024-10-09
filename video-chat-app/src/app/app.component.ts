import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoChatComponent } from './video-chat/video-chat.component';  // Import VideoChatComponent

@Component({
  selector: 'app-root',
  standalone: true,  // Standalone component
  imports: [RouterOutlet, VideoChatComponent],  // Add VideoChatComponent to imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'video-chat-app';
}
