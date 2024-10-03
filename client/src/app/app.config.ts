import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ChatInterfaceComponent } from './chat/chat-interface.component';  // Import your component
import { provideClientHydration } from '@angular/platform-browser';

export const routes = [
  { path: '', component: ChatInterfaceComponent }  // Default route
];

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration()]
};
