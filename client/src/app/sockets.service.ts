import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Only connect to socket.io when in the browser
      this.socket = io('http://localhost:3000', {
        transports: ['websocket'],  // Force WebSocket
      });

      // Handle connection errors
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    } 
  }

  sendMessage(messageObject: { username: string; text: string }): void {
    if (this.socket) {
      this.socket.emit('chat message', messageObject); // Send the entire object
    } else {
      console.error('Socket connection not established');
    }
  }

  // Listen for messages from the server
  getMessages(): Observable<{ username: string; message: string }> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('chat message', (msg: { username: string; message: string }) => {
          observer.next(msg);
        });
      }
    });
  }

  // Send an image message to the server
  sendImageMessage(imageData: string): void {
    if (this.socket) {
      this.socket.emit('imageMessage', imageData);
      console.log('Image message sent:', imageData);
    }
  }

  // Listen for image messages from the server
  getImageMessages(): Observable<any> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('imageMessage', (imageData) => {
          observer.next(imageData);
        });

        this.socket.on('connect_error', (error) => {
          observer.error('Connection Error: ' + error);
        });
      }
    });
  }


  
}
