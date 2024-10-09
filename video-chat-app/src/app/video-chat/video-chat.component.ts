import { Component, OnInit } from '@angular/core';
import { Peer } from 'peerjs';

@Component({
  selector: 'app-video-chat',
  standalone: true,
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css']
})
export class VideoChatComponent implements OnInit {
  peer!: Peer;
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  currentCall: any;

  constructor() {}

  ngOnInit(): void {
    // Initialize PeerJS
    this.peer = new Peer();

    // Open event to get the Peer ID
    this.peer.on('open', (id) => {
      console.log('Peer ID:', id);
      document.getElementById('peer-id')!.innerText = `Your Peer ID: ${id}`;
    });

    // Handle incoming calls
    this.peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        this.localStream = stream;
        call.answer(stream); // Answer the call with the local stream
        call.on('stream', (remoteStream) => {
          this.remoteStream = remoteStream;
          this.addRemoteVideo();
        });
      });
    });
  }

  // Function to start a call with the provided peer ID
  startCall(peerId: string): void {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      this.localStream = stream;
      const call = this.peer.call(peerId, stream); // Start the call with video stream
      call.on('stream', (remoteStream) => {
        this.remoteStream = remoteStream;
        this.addRemoteVideo();
      });
    });
  }

  // New function to start screen sharing
  startScreenShare(peerId: string): void {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(screenStream => {
      this.localStream = screenStream;
  
      // Replace video stream in the existing call
      if (this.currentCall) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.currentCall.peerConnection.getSenders().find((s: RTCRtpSender) => s.track?.kind === 'video');
        sender?.replaceTrack(videoTrack);  // Replace the current video track with the screen track
      } else {
        // Start a new call if none exists
        const call = this.peer.call(peerId, screenStream);
        this.currentCall = call;
        call.on('stream', (remoteStream) => {
          this.remoteStream = remoteStream;
          this.addRemoteVideo();
        });
      }
  
      // Stop screen share when the user stops sharing
      screenStream.getVideoTracks()[0].onended = () => {
        // Switch back to the camera stream when screen sharing ends
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
          this.localStream = stream;
          const videoTrack = stream.getVideoTracks()[0];
          const sender = this.currentCall.peerConnection.getSenders().find((s: RTCRtpSender) => s.track?.kind === 'video');
          sender?.replaceTrack(videoTrack);
        });
      };
    }).catch(err => {
      console.error("Screen sharing error:", err);
    });
  }
  

  // Function to add the remote video stream to the DOM
  addRemoteVideo(): void {
    const videoElement = document.createElement('video');
    videoElement.srcObject = this.remoteStream;
    videoElement.play();
    document.getElementById('remote-video-container')?.appendChild(videoElement);
  }
}
