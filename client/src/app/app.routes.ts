import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoChatComponent } from './video-chat/video-chat.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ChatInterfaceComponent } from './chat/chat-interface.component';
import { GroupManagementComponent } from './group-management/group-management.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

export const routes: Routes = [
  { path: '', component: VideoChatComponent },
  { path: 'dashboard', component: UserManagementComponent },
  { path: 'chat', component: ChatInterfaceComponent },
  { path: 'admin', component: GroupManagementComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [provideHttpClient(withFetch())],
})
export class AppRoutingModule { }