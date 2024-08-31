import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule to use ngModel
import { VideoChatComponent } from './video-chat/video-chat.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { GroupManagementComponent } from './group-management/group-management.component';
import { ChatComponent } from './chat/chat.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule here
    VideoChatComponent,
    UserManagementComponent,
    GroupManagementComponent,
    ChatComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'My Application';
  companyName: string = 'Your Company Name';
  currentSection: string = 'home';
  isAuthenticated: boolean = false;
  username: string = '';
  password: string = '';
  loginError: string | null = null;
  userRole: 'chatUser' | 'groupAdmin' | 'superAdmin' | '' = ''; // Manage user roles with string literals

  // Updated to store groups and their associated channels
  groups: { name: string, channels: { name: string, members: string[] }[], members: string[], requests: string[] }[] = [];
  chatUser: { username: string, publicUsername: string, groups: string[] } | null = null; // Stores the chat user's info

  
  constructor() {
    this.initializeGroups(); // Initialize groups and other data
    this.loadChatUser(); // Load chat user from local storage if available
  }

  initializeGroups() {
    // Sample groups initialized for demonstration
    this.groups = [
      { name: 'Group 1', channels: [{ name: 'Channel 1 of Group 1', members: [] }], members: [], requests: [] },
      { name: 'Group 2', channels: [{ name: 'Channel 1 of Group 2', members: [] }], members: [], requests: [] }
    ];
  }

  navigateTo(section: string) {
    this.currentSection = section;
  }

  login() {
    if (this.username === 'super' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'superAdmin'; // Set role for Super Admin
      this.loginError = null;
      this.navigateTo('home'); // Redirect to home after successful login
    } else if (this.username === 'group' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'groupAdmin'; // Set role for Group Admin
      this.loginError = null;
      this.navigateTo('home'); // Redirect to home after successful login
    } else if (this.username === 'chat' && this.password === '123') {
      this.isAuthenticated = true;
      this.userRole = 'chatUser'; // Set role for Chat User
      this.chatUser = this.getOrCreateChatUser(this.username);
      this.loginError = null;
      this.navigateTo('home'); // Redirect to home after successful login
    } else {
      this.loginError = 'Invalid username or password. Please try again.';
    }
  }

  getOrCreateChatUser(username: string) {
    let publicUsername = localStorage.getItem(`publicUsername_${username}`);
    if (!publicUsername) {
      // Create a consistent public username based on the input username
      publicUsername = `chatuser_${username}`;
      localStorage.setItem(`publicUsername_${username}`, publicUsername);
    }
    return { username, publicUsername, groups: [] };
  }
  getGroup(groupName: string) {
    return this.groups.find(g => g.name === groupName);
  }

  loadChatUser() {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const savedUsername = localStorage.getItem('chatUsername');
      if (savedUsername) {
        this.chatUser = this.getOrCreateChatUser(savedUsername);
        this.isAuthenticated = true;
        this.userRole = 'chatUser';
      }
    }
  }
  

  logout() {
    this.isAuthenticated = false;
    this.username = '';
    this.password = '';
    this.userRole = ''; // Reset user role on logout
    this.chatUser = null; // Reset chat user info
    localStorage.removeItem('chatUsername');
    this.navigateTo('home'); // Redirect to home after logout
  }

  // Group Management functions
  createGroup() {
    const newGroupName = `Group ${this.groups.length + 1}`;
    this.groups.push({ name: newGroupName, channels: [], members: [], requests: [] });
    console.log('Creating group...', newGroupName);
  }

  createChannel(groupName: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      const newChannelName = `Channel ${group.channels.length + 1} of ${groupName}`;
      group.channels.push({ name: newChannelName, members: [] });
      console.log('Creating channel:', newChannelName);
    }
  }

  removeGroup(groupName: string) {
    this.groups = this.groups.filter(g => g.name !== groupName);
    console.log('Removing group:', groupName);
  }

  removeChannel(groupName: string, channelName: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      group.channels = group.channels.filter(c => c.name !== channelName);
      console.log('Removing channel:', channelName, 'from', groupName);
    }
  }

  joinGroupRequest(groupName: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group && this.chatUser) {
      if (!group.requests.includes(this.chatUser.username)) {
        group.requests.push(this.chatUser.username);
        console.log('Requesting to join group:', groupName);
      }
      // Remove the join request button for the user
      if (this.currentSection === 'groupManagement') {
        this.chatUser.groups.push(groupName);
      }
    }
  }
  
  channelMessages: { [channelName: string]: { username: string, text: string }[] } = {};
  newMessage: { [channelName: string]: string } = {};
  
  leaveGroup(groupName: string) {
    const chatUsername = this.chatUser?.username;

    if (chatUsername && this.chatUser) {
      if (this.chatUser.groups == null) {
        this.chatUser.groups = [];
      } else if (!Array.isArray(this.chatUser.groups)) {
        this.chatUser.groups = [];
      }

      this.chatUser.groups = this.chatUser.groups.filter(g => g !== groupName);

      const group = this.groups.find(g => g.name === groupName);

      if (group) {
        if (group.members == null) {
          group.members = [];
        } else if (!Array.isArray(group.members)) {
          group.members = [];
        }

        group.members = group.members.filter(m => m !== chatUsername);

        group.channels.forEach(channel => {
          if (channel.members == null) {
            channel.members = [];
          } else if (!Array.isArray(channel.members)) {
            channel.members = [];
          }

          channel.members = channel.members.filter(m => m !== chatUsername);
        });

        console.log('Leaving group:', groupName);
      } else {
        console.warn('Group not found:', groupName);
      }
    } else {
      console.warn('Chat user or username is not defined');
    }
  }

  deleteAccount() {
    if (this.chatUser) {
      if (confirm('Are you sure you want to delete your account?')) {
        console.log('Deleting account for user:', this.chatUser.username);
        this.logout();
      } else {
        console.log('Account deletion cancelled.');
      }
    }
  }

  approveRequest(groupName: string, username: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      group.requests = group.requests.filter(r => r !== username);
      group.members.push(username);
      group.channels.forEach(channel => {
        if (!channel.members.includes(username)) {
          channel.members.push(username);
        }
      });
      if (this.chatUser && this.chatUser.username === username) {
        this.updateChatUserGroups(groupName); // Update chat user's groups
      }
      console.log('Approved request for user:', username, 'to join group:', groupName);
    }
  }
  

  denyRequest(groupName: string, username: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      group.requests = group.requests.filter(r => r !== username);
      console.log('Denied request for user:', username, 'to join group:', groupName);
    }
  }

  removeMember(groupName: string, username: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      group.members = group.members.filter(m => m !== username);
      group.channels.forEach(channel => {
        channel.members = channel.members.filter(m => m !== username);
      });
      if (this.chatUser && this.chatUser.username === username) {
        this.chatUser.groups = this.chatUser.groups.filter(g => g !== groupName);
      }
      console.log('Removed user:', username, 'from group:', groupName);
    }
  }

  joinChannel(groupName: string, channelName: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      const channel = group.channels.find(c => c.name === channelName);
      if (channel && this.chatUser?.groups?.includes(groupName)) {
        if (this.chatUser.username && !channel.members.includes(this.chatUser.username)) {
          channel.members.push(this.chatUser.username);
          console.log('Joined channel:', channelName, 'in group:', groupName);
        } else {
          console.warn('Already a member of the channel or channel not found');
        }
      } else {
        console.warn('User is not part of the group or group not found');
      }
    } else {
      console.warn('Group not found:', groupName);
    }
  }

  leaveChannel(groupName: string, channelName: string) {
    const group = this.groups.find(g => g.name === groupName);

    if (group) {
      const channel = group.channels.find(c => c.name === channelName);

      if (channel) {
        const chatUsername = this.chatUser?.username;

        if (chatUsername) {
          channel.members = channel.members.filter(m => m !== chatUsername);
          console.log('Left channel:', channelName, 'in group:', groupName);
        } else {
          console.warn('Chat user or username is not defined');
        }
      } else {
        console.warn('Channel not found:', channelName);
      }
    } else {
      console.warn('Group not found:', groupName);
    }
  }

  getChannels(groupName: string) {
    const group = this.groups.find(g => g.name === groupName);
    return group ? group.channels ?? [] : [];
  }

  updateChatUserGroups(groupName: string) {
    if (this.chatUser && !this.chatUser.groups.includes(groupName)) {
      this.chatUser.groups.push(groupName);
    }
  }

  updateChatUserChannels(groupName: string, channelName: string) {
    const group = this.groups.find(g => g.name === groupName);
    if (group) {
      const channel = group.channels.find(c => c.name === channelName);
      if (channel && this.chatUser && !channel.members.includes(this.chatUser.username)) {
        channel.members.push(this.chatUser.username);
      }
    }
  }

  users: { username: string, role: 'chatUser' | 'groupAdmin' | 'superAdmin' }[] = [];

  createUser() {
    const newUsername = prompt('Enter a new username:');
    if (newUsername) {
      this.users.push({ username: newUsername, role: 'chatUser' });
      console.log('User created:', newUsername);
    }
  }

  deleteUser() {
    const usernameToDelete = prompt('Enter the username to delete:');
    if (usernameToDelete) {
      this.users = this.users.filter(user => user.username !== usernameToDelete);
      console.log('User deleted:', usernameToDelete);
    }
  }

  promoteUser() {
    const usernameToPromote = prompt('Enter the username to promote:');
    if (usernameToPromote) {
      const userToPromote = this.users.find(user => user.username === usernameToPromote);
      if (userToPromote) {
        userToPromote.role = 'groupAdmin';
        console.log('User promoted:', usernameToPromote);
      }
    }
  }

  sendMessage(groupName: string, channelName: string) {
    const channel = this.getChannel(groupName, channelName);
    if (channel && this.chatUser) {
      const message = this.newMessage[channelName];
      if (message.trim()) {
        // Add message to channel's messages
        if (!this.channelMessages[channelName]) {
          this.channelMessages[channelName] = [];
        }
        this.channelMessages[channelName].push({
          username: this.chatUser.username,
          text: message
        });
        // Clear the input field
        this.newMessage[channelName] = '';
        
        // Store messages to localStorage (for persistence across sessions)
        this.saveMessagesToLocalStorage();
      }
    }
  }
  
  getChannel(groupName: string, channelName: string) {
    const group = this.groups.find(g => g.name === groupName);
    return group ? group.channels.find(c => c.name === channelName) : null;
  }
  
  saveMessagesToLocalStorage() {
    localStorage.setItem('channelMessages', JSON.stringify(this.channelMessages));
  }
  
  loadMessagesFromLocalStorage() {
    const savedMessages = localStorage.getItem('channelMessages');
    if (savedMessages) {
      this.channelMessages = JSON.parse(savedMessages);
    }
  }
  
}
