//app.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
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
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


interface Channel {
  _id: string;
  name: string;
  members: string[];
}

interface User {
  _id: string;       // The user's unique ID from MongoDB
  username: string;  // The user's username
  role: string;      // The user's role ('superAdmin', 'groupAdmin', 'chatUser')
  groups: any[];     // An array of groups the user is part of
  channels: any[];   // An array of channels the user is part of
}
interface Group {
  _id?: string; // Optional if it's not available until created
  name: string;
  channels: {
_id: string; name: string; members: string[] 
}[];
  members: string[];
  requests: string[];
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

export class AppComponent implements OnInit {
  title = 'Chat Application';
  companyName: string = 'Your Company Name';
  currentSection: string = 'home';
  isAuthenticated: boolean = false;
  username: string;
  groupName!: string;
  password: string = '';
  loginError: string | null = null;
  userRole: string = '';  // Manage user roles with string literals
  message: string = '';
  messages: { username: string; message: string; }[] = [];
  channelMessages: { [channelName: string]: { username: string, text: string }[] } = {};
  newMessage: { [channelName: string]: string } = {};
  private apiUrl = 'http://localhost:5000/api/messages';
  userGroups: any[] = []; // Store user's groups
  userChannels: any[] = []; // Store user's channels
  groups: Group[] = [];
  approvedUsers: string[] = [];  // Initialize the array in the class
  channels: Channel[] = [];  // Initialize an empty array or assign the fetched channels
  messageText: string = '';
  currentChannel: string | null = null;
  router: any;
  userId: string = '';
  userService: any;
 
  
  constructor(private socketService: SocketService, private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.username = this.getUsername(); // Automatically get the username
    this.getChannels();
  }

   // Updated to store groups and their associated channels
  chatUser: { username: string, publicUsername: string, groups: string[] } | null = null; // Stores the chat user's info

  getUserRequestedGroup() {
    console.log(this.username);
    console.log(this.groupName);
    // Make a GET request to your API to fetch the user's requested groups
    this.http.get<{ username: string, groupName: string }>('http://localhost:5000/api/user/requested-groups')
      .subscribe(
        (response) => {
          this.username = response.username; // Assuming the response has a 'username' field
          this.groupName = response.groupName; // Assuming the response has a 'groupName' field
        },
        (error) => {
          console.error('Error fetching user requested group:', error);
        }
      );
  }

  approveRequest(username: string, groupName: string) {
    
    const payload = { username, groupName }; // Create the payload object
    console.log(payload); // Ensure this is correctly set
  

    this.http.post(`http://localhost:5000/api/groups/approve-request`, payload).subscribe(
      response => {
        console.log('Request approved!', response); // Log the response
        // Handle successful approval, e.g., show a message or refresh the list of requests
        // Remove the approved request from the group.requests array
        const group = this.groups.find(g => g.name === groupName);
        if (group) {
          group.requests = group.requests.filter(request => request !== username);
        }
      },
      error => {
        console.error('Error approving request', error); // Log the error
        // Handle the error, e.g., show an error message
      }
    );

    this.http.post(`http://localhost:5000/api/groups/remove-from-requests`, payload).subscribe(
      response => {
        console.log('deleted user!', response); // Log the response
        // Handle successful approval, e.g., show a message or refresh the list of requests
        // Remove the approved request from the group.requests array
        const group = this.groups.find(g => g.name === groupName);
        if (group) {
          group.requests = group.requests.filter(request => request !== username);
        }
      },
      error => {
        console.error('Error deleting user', error); // Log the error
        // Handle the error, e.g., show an error message
      }
    );
  }
  
// Method to fetch user details
fetchUserDetails(userId: string) {
  this.http.get<User>(`http://localhost:5000/users/${userId}`)
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
    this.http.get<User>(`http://localhost:5000/users/${userId}`)
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
  
    this.http.post('http://localhost:5000/api/login', loginData)
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
  
          // Initialize the chatUser object here
          this.chatUser = {
          username: response.user.username,
          publicUsername: response.user.username,
          groups: []
        };

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
  // Create the group object (without pushing it yet)
  const newGroup: { _id?: string, name: string, channels: any[], members: any[], requests: any[] } = {
    _id: undefined, // Initialize _id as undefined
    name: groupName,
    channels: [],
    members: [],
    requests: []
  };

  console.log(`Creating group: ${groupName}`);

  // Assume adminId is obtained from local storage or other sources
  const adminId = localStorage.getItem('userId'); // Replace with your method of getting the admin ID

  // Call the backend to save the new group
  this.http.post('http://localhost:5000/api/create-group', { name: groupName, adminId })
    .subscribe(
      (response: any) => {
        // Assuming response contains the newly created group with _id
        newGroup._id = response._id;  // Update the local object with the _id from DB

        // Now update the local state
        this.groups.push(newGroup);  // Add the group to the list only after it's successfully created in the DB
        console.log('Group created successfully:', response);
        alert ('Group created successfully');
      },
      (error) => {
        console.error('Error creating group:', error);
      }
    );
}


createChannel(groupId: string) {
  // Find the group in the local state
  const group = this.groups.find(g => g._id === groupId);

  if (group) {
      // Determine the new channel number by checking the number of channels in the group
      const newChannelNumber = group.channels.length + 1;
      const newChannelName = `Channel ${newChannelNumber}`; // Sequential naming

      // Call the backend to save the new channel
      this.http.post('http://localhost:5000/api/create-channel', { name: newChannelName, groupId })
          .subscribe(
              (response: any) => {
                  // Now we can push the response which includes the _id
                  const createdChannel = { ...response }; // Assuming the backend returns the created channel with an _id
                  group.channels.push(createdChannel);
                  console.log(`Channel created: ${createdChannel.name} in Group ${group.name}`);
                  alert ('Channel created successfully');
              },
              (error) => {
                  console.error('Error creating channel:', error);
              }
          );
  } else {
      console.error(`Group with ID ${groupId} not found.`);
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

  joinGroup(groupName: string) {
    const userId = localStorage.getItem('userId'); // Get userId from localStorage
    this.http.post('http://localhost:5000/api/join-group', { userId, groupName })
      .subscribe(
        (response: any) => {
          console.log('Joined group successfully:', response);
          alert('Joined group successfully');
        },
        (error) => {
          console.error('Error joining group:', error);
        }
      );
  }
  
  joinChannel(channelId: string) {
    const payload = { username: this.username, channelId };
    console.log('Joining channel with ID:', channelId);
    this.http.post('http://localhost:5000/api/channels/join', payload).subscribe(
      (response) => {
        console.log('Joined channel successfully!', response);
        alert('Joined channel successfully');

        const channel = this.channels.find(c => c._id === channelId);
        if (channel && !channel.members.includes(this.username)) {
          channel.members.push(this.username); // Add the username to the channel's members
        }
      },
      (error) => {
        console.error('Error joining channel:', error);
      }
    );
  }


joinGroupRequest(groupName: string) {
  console.log('Join group request initiated for group:', groupName); // Debugging log
  const group = this.groups.find(g => g.name === groupName);

  if (!group) {
    console.error('Group not found:', groupName);
    return; // Exit if group is not found
  }

  console.log('Found group:', group); // Debugging log
  console.log("Username:", this.username); // Ensure this is correctly set
  console.log("Group Name:", groupName);   // This should not be undefined


  if (!this.chatUser) {
    console.error('Chat user is not initialized.');
    return; // Exit if chatUser is null
  }

  if (!group.requests.includes(this.chatUser.username)) {
    group.requests.push(this.chatUser.username);
    console.log('User join request added:', this.chatUser.username); // Debugging log

    // Now send a request to the backend server
    this.http.post(`http://localhost:5000/api/groups/requestJoin`, {
      username: this.chatUser.username,
      groupName: groupName
    }).pipe(
      tap(response => {
        console.log('Join request sent successfully:', response);
        alert('Join request sent successfully');
      }),
      catchError(error => {
        console.error('Error sending join request:', error);
        return of(null); // Handle error and return a fallback value
      })
    ).subscribe();
  } else {
    console.log('User has already requested to join this group:', this.chatUser.username); // Debugging log
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
    const userId = localStorage.getItem('userId');

    console.log('Delete Account button clicked');
    console.log('Current User ID:', userId); // Check the user ID being passed

    if (userId) {
        this.http.delete(`http://localhost:5000/api/users/deleteAccount/${userId}`).subscribe(
            (response: any) => {
                console.log('Response from deleteAccount:', response);
                alert('Account Deleted');
                // Refresh the page after a successful delete
                location.reload();
            },
            (error: any) => {
                console.error('Error deleting account:', error);
            }
        );
    } else {
        console.error('No user ID found in localStorage');
    }
}

deleteUser() {
  const usernameToDelete = prompt('Enter the username to delete:');

  console.log('Username to delete:', usernameToDelete);

  if (usernameToDelete) {
      // Replace the placeholder with the actual username
      this.http.delete(`http://localhost:5000/api/users/deleteUser/${usernameToDelete}`).subscribe(
          (response: any) => {
              console.log('Response from deleteAccount:', response);
              alert(`User ${usernameToDelete} has been deleted successfully.`);
              // Refresh the page after a successful delete
              location.reload();
          },
          (error: any) => {
              console.error('Error deleting account:', error);
              alert(`Error deleting user: ${usernameToDelete}. Please try again.`);
          }
      );
  } else {
      console.error('No username entered');
      alert('Please enter a username to delete.');
  }
}

  
  approveUser(username: string, groupName: string) {
    // Assuming you have an array to hold approved users
    if (!this.approvedUsers) {
      this.approvedUsers = [];  // Initialize the array if it doesn't exist
    }
    
    // Perform your API request here
    this.http.post('/api/groups/approve-request', { username, groupName })
      .subscribe(response => {
        // If the response is successful
        this.approvedUsers.push(username);  // Push the username to the array
        console.log('Approved Users:', this.approvedUsers);
        alert('User Approved');
      }, error => {
        console.error(error);
      });
  }

  denyRequest(username: string, groupName: string) {
    
    const payload = { username, groupName }; // Create the payload object
    console.log(payload); // Ensure this is correctly set
  
    this.http.post(`http://localhost:5000/api/groups/remove-from-requests`, payload).subscribe(
      response => {
        console.log('deleted user!', response); // Log the response
        // Handle successful approval, e.g., show a message or refresh the list of requests
        // Remove the approved request from the group.requests array
        const group = this.groups.find(g => g.name === groupName);
        if (group) {
          group.requests = group.requests.filter(request => request !== username);
        }
        alert('User Denied');
      },
      error => {
        console.error('Error deleting user', error); // Log the error
        // Handle the error, e.g., show an error message
      }
    );
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


promoteUser() {
  const usernameToPromote = prompt('Enter the username to promote:'); // Prompt for username

  console.log('Promote User button clicked');
  console.log('Username to promote:', usernameToPromote);

  if (usernameToPromote) {
      this.http.patch(`http://localhost:5000/api/users/promote/${usernameToPromote}`, {}).subscribe(
          (response: any) => {
              console.log('Response from promote:', response);
              alert(`User ${usernameToPromote} has been promoted.`);
              // Optional: refresh the user list or update the UI accordingly
          },
          (error: any) => {
              console.error('Error promoting user:', error);
              alert(`User is already at it highest Role.`);
          }
      );
  } else {
      console.error('No username entered');
      alert('Please enter a username to promote.');
  }
}

demoteUser() {
  const usernameToDemote = prompt('Enter the username to demote:'); // Prompt for username

  console.log('Demote User button clicked');
  console.log('Username to demote:', usernameToDemote);

  if (usernameToDemote) {
      this.http.patch(`http://localhost:5000/api/users/demote/${usernameToDemote}`, {}).subscribe(
          (response: any) => {
              console.log('Response from demote:', response);
              alert(`User ${usernameToDemote} has been demoted.`);
              // Optional: refresh the user list or update the UI accordingly
          },
          (error: any) => {
              console.error('Error demoting user:', error);
              alert(`User is already at the lowest Role.`);
          }
      );
  } else {
      console.error('No username entered');
      alert('Please enter a username to demote.');
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

        this.http.post('http://localhost:5000/api/register', newUser).subscribe(
            (response) => {
                console.log('User registered:', newUser);
                this.username = newUsername;
                this.password = newPassword;
                this.login();
                this.chatUser = newUser;
            },
            (error) => {
                console.error('Error registering user:', error);
                alert('User already exists.');
            }
        );
    }
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

  loadGroups() {
    this.http.get<any[]>('http://localhost:5000/api/groups') // Adjust your API endpoint accordingly
      .subscribe(
        (data) => {
          this.groups = data; // Store fetched data in the groups array
        },
        (error) => {
          console.error('Error fetching groups:', error);
        }
      );
  }

  ngOnInit(): void {
     
    this.getUserData(); // Call the method here to fetch user data on initialization
    this.loadGroups(); // Load groups when the component initializes
    this.getChannels(); 
    
    
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

  getChannels() {
    this.http.get<Channel[]>('http://localhost:5000/api/channels')
      .subscribe(
        (data) => {
          this.channels = data;
        },
        (error) => {
          console.error('Error fetching channels:', error);
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