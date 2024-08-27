video-chat.component.ts


import { Component, OnInit } from '@angular/core';
import Peer from 'peerjs';

@Component({
  selector: 'app-video-chat',
  standalone: true, // Mark as standalone
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css'],
})
export class VideoChatComponent implements OnInit {
  private peer: any;
  private localStream: MediaStream | null = null;
  private remoteStreams: { [key: string]: MediaStream } = {};

  constructor() {}

  ngOnInit(): void {
    this.peer = new Peer(); // Initialize PeerJS

    this.peer.on('open', (id: string) => {
      console.log('PeerJS connection established with ID:', id);
    });

    this.peer.on('call', (call: any) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        this.localStream = stream;
        call.answer(stream); // Answer the call with the local stream

        call.on('stream', (remoteStream: MediaStream) => {
          this.remoteStreams[call.peer] = remoteStream;
          this.updateRemoteStreams();
        });
      });
    });
  }

  callPeer(peerId: string): void {
    if (this.localStream) {
      const call = this.peer.call(peerId, this.localStream);
      call.on('stream', (remoteStream: MediaStream) => {
        this.remoteStreams[peerId] = remoteStream;
        this.updateRemoteStreams();
      });
    }
  }

  updateRemoteStreams(): void {
    // Logic to update the UI with remote streams
  }
}
