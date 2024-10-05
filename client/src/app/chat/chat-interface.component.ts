import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SocketService } from '../sockets.service';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.css'],
  imports: [FormsModule, CommonModule]
})
export class ChatInterfaceComponent {
  message: string = '';
  messages: { username: string; message: string }[] = [];
  username: string = '';

  constructor(private socketService: SocketService) {
    this.username = this.getUsername(); // Automatically get the username
  }

  ngOnInit(): void {
    // Listen for incoming messages from the server
    this.socketService.getMessages().subscribe(
      (msg: { username: string; message: string }) => {
        console.log('Received message:', msg);
        this.messages.push(msg);
      },
      (error) => {
        console.error('Socket error: ', error);
      }
    );
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    if (this.message.trim()) {
      // Create message object with the username
      const messageObject = {
        username: this.username,
        text: this.message,
      };
      // Send the message to the server
      this.socketService.sendMessage(messageObject);
      this.message = '';  // Clear the input after sending
    }
  }

  getUsername(): string {
    // Implement your logic to get the username here
    // For example, you might get it from local storage or a service
    return 'username'; // Replace with actual logic to get the username
  }
}
