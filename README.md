# Chat System

## Introduction
This project is a text and video chat system that allows users to communicate with each other in real-time within different groups and channels. The system is built using the MEAN stack (MongoDB, Express, Angular, Node) along with sockets.io for real-time communication and Peer.js for video streaming.

## Features
The chat system has three levels of permissions:
1. **Super Admin**
2. **Group Admin**
3. **User**

### Group
- Groups are collections of chat users with permissions granted by a Group Admin or Super Admin.
- Users can be members of multiple groups.
- Groups can have multiple admins.
- Group Admins can administer more than one group.
- Super Admins can promote users to Group Admins and have access to all groups.

### Channel
- Channels are subgroups within groups for the purpose of chatting.
- Users who are members of a group can join any channel within that group.

### Users
- Users are identified by a unique username, email, and assigned roles and groups.
- Users can join or leave groups, and participate in channels within their groups.
- Users can delete their accounts or log out.

## User Roles

### Super Administrator
- Can promote users to Group Admins or Super Admins.
- Can remove users and has all the functionalities of a Group Admin.
- Has access to all groups and channels.

### Group Administrator
- Can create and manage groups and channels.
- Can remove users from the groups they administer.
- Can ban users from channels and report them to Super Admins.

### Chat User
- Can create a new chat user account.
- Can join groups and channels.
- Can register interest in groups and leave groups.

## User Authentication
- Initial setup includes a Super Admin with the username `super` and password `123`.
- Users must authenticate with a username and password.
- Authenticated users can access features based on their role.

## Data Storage
- In the first phase, browser-based local storage is used for storing data structures.
- MongoDB will be introduced in the second phase for persistent storage.

## Documentation

### Git Repository Organization
- **Branching**: The project follows a feature-branching model where each feature or bug fix is developed in a separate branch.
- **Update Frequency**: Regular commits are made to the repository to track progress and maintain a history of changes.
- **Structure**:
  - `server/`: Contains the Node.js backend, including Express routes, socket handlers, and Peer.js integration.
  - `client/`: Contains the Angular frontend, including components, services, and models.

### Data Structures
- **User**: `{ username: string, email: string, id: string, roles: string[], groups: string[] }`
- **Group**: `{ id: string, name: string, adminIds: string[], channelIds: string[] }`
- **Channel**: `{ id: string, groupId: string, name: string, userIds: string[] }`

### Angular Architecture
- **Components**: `LoginComponent`, `GroupComponent`, `ChannelComponent`, `ChatComponent`, `AdminDashboardComponent`
- **Services**: `AuthService`, `GroupService`, `ChannelService`, `ChatService`
- **Models**: `User`, `Group`, `Channel`
- **Routes**:
  - `/login`: Displays the login page.
  - `/groups`: Displays the groups the user is a member of.
  - `/channels/:groupId`: Displays the channels within a group.
  - `/chat/:channelId`: Displays the chat interface for a channel.
  - `/admin`: Displays the admin dashboard for Super Admins and Group Admins.

### Node Server Architecture
- **Modules**: `auth.js`, `groups.js`, `channels.js`, `chat.js`, `admin.js`
- **Functions**: `login`, `register`, `createGroup`, `deleteGroup`, `createChannel`, `deleteChannel`, `sendMessage`, `promoteUser`
- **Files**:
  - `server.js`: Entry point of the Node.js application.
  - `routes/`: Contains route handlers for different functionalities.
  - `models/`: Contains Mongoose models (for the second phase).
- **Global Variables**: `io` (socket.io instance), `peerServer` (Peer.js server instance)

### Server-Side Routes
- **POST /login**: Authenticates a user. Returns a token.
- **POST /register**: Registers a new user.
- **GET /groups**: Retrieves the groups the authenticated user is a member of.
- **POST /groups**: Creates a new group (Group Admin only).
- **DELETE /groups/:groupId**: Deletes a group (Group Admin only).
- **POST /channels**: Creates a new channel within a group (Group Admin only).
- **DELETE /channels/:channelId**: Deletes a channel within a group (Group Admin only).
- **POST /messages**: Sends a message to a channel.
- **POST /promote**: Promotes a user to Group Admin (Super Admin only).

### Client-Server Interaction
- **Login**: User submits login credentials via `AuthService`. Server validates and returns a token. Angular stores the token and displays the user’s groups.
- **Group Management**: Admins create or delete groups via `GroupService`. The server updates the database, and the Angular component refreshes the group list.
- **Channel Management**: Admins create or delete channels within a group via `ChannelService`. The server updates the database, and the Angular component refreshes the channel list.
- **Chat**: Messages are sent via `ChatService` using sockets.io. The server broadcasts the message to all users in the channel, and the Angular component updates the chat interface.

## Getting Started
### Prerequisites
- Node.js
- Angular CLI
- MongoDB (for phase 2)

### Installation
1. Clone the repository: `git clone https://github.com/yourusername/chatsystem.git`
2. Navigate to the project directory:
   - `cd server`: Set up the backend.
   - `cd client`: Set up the frontend.
3. Install dependencies:
   - `npm install` (for both server and client)
4. Start the server:
   - `npm start` (in the `server` directory)
5. Start the client:
   - `ng serve` (in the `client` directory)
6. Access the application at `http://localhost:4200`.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
