import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoChatComponent } from './video-chat/video-chat.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ChatComponent } from './chat/chat.component';
import { GroupManagementComponent } from './group-management/group-management.component';

export const routes: Routes = [
  { path: '', component: VideoChatComponent },
  { path: 'dashboard', component: UserManagementComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'admin', component: GroupManagementComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }