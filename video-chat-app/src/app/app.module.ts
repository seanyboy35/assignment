import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { VideoChatComponent } from './video-chat/video-chat.component'; // Import VideoChatComponent

@NgModule({
  declarations: [
    AppComponent,
    VideoChatComponent // Declare VideoChatComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
