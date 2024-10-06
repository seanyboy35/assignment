import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule to use ngModel
import { VideoChatComponent } from './video-chat/video-chat.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { GroupManagementComponent } from './group-management/group-management.component';
import { SocketService } from './sockets.service';
import { Injectable } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
  _id: string;       // The user's unique ID from MongoDB
  username: string;  // The user's username
  role: string;      // The user's role ('superAdmin', 'groupAdmin', 'chatUser')
  groups: any[];     // An array of groups the user is part of
  channels: any[];   // An array of channels the user is part of
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule here
    VideoChatComponent,
    UserManagementComponent,
    GroupManagementComponent,
    HttpClientModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

@Injectable({
  providedIn: 'root'
})

export class AppComponent {
  title = 'Chat Application';
  companyName: string = 'Your Company Name';
  currentSection: string = 'home';
  isAuthenticated: boolean = false;
  username: string = '';
  password: string = '';
  loginError: string | null = null;
  userRole: string = '';  // Manage user roles with string literals
  message: string = '';
  messages: { username: string; message: string; }[] = [];
  channelMessages: { [channelName: string]: { username: string, text: string }[] } = {};
  newMessage: { [channelName: string]: string } = {};
  private apiUrl = 'http://localhost:3000/api/messages';
  userGroups: any[] = []; // Store user's groups
  userChannels: any[] = []; // Store user's channels

  
  constructor(private socketService: SocketService, private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.username = this.getUsername(); // Automatically get the username
  }

   // Updated to store groups and their associated channels
  groups: { name: string, channels: { name: string, members: string[] }[], members: string[], requests: string[] }[] = [];
  chatUser: { username: string, publicUsername: string, groups: string[] } | null = null; // Stores the chat user's info


  
// Method to fetch user details
fetchUserDetails(userId: string) {
  this.http.get<User>(`http://localhost:3000/users/${userId}`)
    .subscribe(
      user => {
        this.userRole = user.role;
        this.userGroups = user.groups;
        this.userChannels = user.channels;
        console.log('User Role:', this.userRole);
        console.log('User Groups:', this.userGroups);
        console.log('User Channels:', this.userChannels);
      },
      error => {
        console.error('Error fetching user details:', error);
      }
    );
}
getUserData() {
  if (isPlatformBrowser(this.platformId)) {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
  console.log('Fetching user data for userId:', userId); // Debugging log
  if (userId) {
    this.http.get<User>(`http://localhost:3000/users/${userId}`)
      .subscribe(
        (user) => {
          console.log('User data retrieved:', user); // For debugging
          this.userRole = user.role; // Set the user role from the response
        },
        (error) => {
          console.error('Error retrieving user data:', error);
        }
      );
  } else {
    console.warn('User ID is not found in local storage.');
  }
}
}
  initializeGroups() {
    // Sample groups initialized for demonstration
    this.groups = [
    ];
  }

  navigateTo(section: string) {
    this.currentSection = section;
  }

  login() {
    const loginData = {
      username: this.username,
      password: this.password
    };
  
    this.http.post('http://localhost:3000/api/login', loginData)
      .subscribe(
        (response: any) => {
          console.log('Login Response:', response);
  
          // If login is successful
          this.isAuthenticated = true;
  
          // Store userId in localStorage using the response object
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('userId', response.user._id); // Use response.user._id instead of user._id
            localStorage.setItem('userRole', response.user.role); // Store userRole in localStorage
          }
          
          // Fetch user role from response and ensure it's one of the expected values
          const roleFromBackend = response.user.role;
          if (roleFromBackend === 'chatUser' || roleFromBackend === 'groupAdmin' || roleFromBackend === 'superAdmin') {
            this.userRole = roleFromBackend; // Set role if it's valid
          } else {
            this.userRole = 'chatUser'; // Handle unexpected roles
          }
  
          this.fetchUserDetails(response.user._id); // Use the logged-in user's ID to fetch details
          this.loginError = null;
          this.navigateTo('home'); // Redirect to home after successful login
          console.log('Login Successful, ', this.username);
          console.log('Current User Role:', this.userRole);
        },
        (error) => {
          // If login fails
          this.loginError = error.error.message || 'Invalid username or password. Please try again.';
        }
      );
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
    this.chatUser = null; // Reset chat user info
    localStorage.removeItem('chatUsername');
    this.navigateTo('home'); // Redirect to home after logout
    console.log(this.username, 'logged out successfully');
  }

  // Group Management functions
  createGroup(groupName: string = `Group ${this.groups.length + 1}`) {
  this.groups.push({ name: groupName, channels: [], members: [], requests: [] });
  console.log(`Group created: ${groupName}`);
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

  users: { username: string, password: string, role: 'chatUser' | 'groupAdmin' | 'superAdmin' }[] = [];

createUser() {
  const newUsername = prompt('Enter a new username:');
  const newPassword = prompt('Enter a password for the new user:');
  
  // Check if the username already exists
  const existingUser = this.users.find(user => user.username === newUsername);
  
  if (!existingUser && newUsername && newPassword) {
    this.users.push({ username: newUsername, password: newPassword, role: 'chatUser' });
    console.log('User created:', newUsername);
  } else {
    console.log('Username already exists. Please choose a different username.');
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
        if (userToPromote.role === 'chatUser') {
          userToPromote.role = 'groupAdmin';
          console.log('User promoted from ChatUser to GroupAdmin:', usernameToPromote);
        } else if (userToPromote.role === 'groupAdmin') {
          userToPromote.role = 'superAdmin';
          console.log('User promoted from GroupAdmin to SuperAdmin:', usernameToPromote);
        }
      }
    }
  }
  demoteUser() {
    const usernameToDemote = prompt('Enter the username to demote:');
    if (usernameToDemote) {
      const userToDemote = this.users.find(user => user.username === usernameToDemote);
      if (userToDemote) {
        if (userToDemote.role === 'superAdmin') {
          userToDemote.role = 'groupAdmin';
          console.log('User Demoted', usernameToDemote);
        } else if (userToDemote.role === 'groupAdmin') {
          userToDemote.role = 'chatUser';
          console.log('User Demoted:', usernameToDemote);
        }
      }
    }
  }

  register() {
    const newUsername = prompt('Enter a new username:');
    const newPassword = prompt('Enter a password for the new user:');
    const newEmail = prompt('Enter an email for the new user:');

    if (newUsername && newPassword && newEmail) {
        const newUser = {
            id: Date.now(), // Generate a unique ID based on the current timestamp
            username: newUsername,
            publicUsername: newUsername,
            email: newEmail,
            groups: [],
            password: newPassword,
            role: 'chatUser' as 'chatUser'
        };

        this.http.post('http://localhost:3000/api/register', newUser).subscribe(
            (response) => {
                console.log('User registered:', newUser);
                this.username = newUsername;
                this.password = newPassword;
                this.login();
                this.chatUser = newUser;
            },
            (error) => {
                console.error('Error registering user:', error);
            }
        );
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

  banMember(groupName: string, channelName: string, member: string): void {
    console.log(`Reporting to super admins: Banned member ${member} from channel ${channelName} in group ${groupName}`)
  }

  ngOnInit(): void {
    
    this.getUserData(); // Call the method here to fetch user data on initialization
    // Listen for incoming messages from the server
    this.socketService.getMessages().subscribe(
      (msg: { username: string; message: string; }) => {
        console.log('Received message:', msg);
        this.messages.push(msg);
      },
      (error) => {
        console.error('Socket error: ', error);
      }
    );
  }

// Send a new message to the server
sendMessage(username: string, text: string): void {
  const messageObject = { username: username, text: text }; // Use the parameters correctly
  this.socketService.sendMessage(messageObject); // Send the message object to the socket service
}

// Retrieve all messages from the server
getMessages(): Observable<any> {
  return this.http.get(this.apiUrl);
}

  getUsername(): string {
    // Implement your logic to get the username here
    // For example, you might get it from local storage or a service
    return 'username'; // Replace with actual logic to get the username
  }
}
