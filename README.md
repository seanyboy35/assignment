# Chat System

## Introduction
This project is a text and video chat system that allows users to communicate with each other in real-time within different groups and channels. The system is built using the MEAN stack (MongoDB, Express, Angular, Node) along with Socket.io for real-time communication and Peer.js for video streaming.

## Features
The chat system has three levels of permissions:
- **Super Admin**
- **Group Admin**
- **User**

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
- Users can join or leave groups and participate in channels within their groups.
- Users can delete their accounts or log out.

### Messages
- Messages are sent in real-time within channels.
- Each message is stored in the database with the sender's username, text content, and a timestamp.

## User Roles
- **Super Administrator**: 
  - Can promote users to Group Admins or Super Admins.
  - Can remove users and has all the functionalities of a Group Admin.
  - Has access to all groups and channels.
  
- **Group Administrator**:
  - Can create and manage groups and channels.
  - Can remove users from the groups they administer.
  - Can ban users from channels and report them to Super Admins.

- **Chat User**:
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
  
**Structure:**
- `server/`: Contains the Node.js backend, including Express routes, socket handlers, and Peer.js integration.
- `client/`: Contains the Angular frontend, including components, services, and models.

### Data Structures
**Client-Side**
- **User**: `{ username: string, email: string, id: string, roles: string[], groups: string[], channels: string[] }`
- **Group**: `{ id: string, name: string, adminIds: string[], channelIds: string[] }`
- **Channel**: `{ id: string, groupId: string, name: string, userIds: string[], messages: Message[] }`
- **Message**: `{ username: string, text: string, timestamp: Date }`

**Server-Side**
- **User Schema**:
    ```javascript
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true },
      roles: { type: [String], required: true },
      groups: { type: [String], required: true },
      channels: { type: [String], required: true }
    });
    ```

- **Group Schema**:
    ```javascript
    const groupSchema = new mongoose.Schema({
      name: { type: String, required: true },
      adminIds: { type: [String], required: true },
      channelIds: { type: [String], required: true }
    });
    ```

- **Channel Schema**:
    ```javascript
    const channelSchema = new mongoose.Schema({
      groupId: { type: String, required: true },
      name: { type: String, required: true },
      userIds: { type: [String], required: true },
      messages: { type: [messageSchema], default: [] }
    });
    ```

- **Message Schema**:
    ```javascript
    const messageSchema = new mongoose.Schema({
      username: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    });
    ```

### Angular Architecture
- **Components**: LoginComponent, GroupComponent, ChannelComponent, ChatComponent, AdminDashboardComponent
- **Services**: AuthService, GroupService, ChannelService, ChatService
- **Models**: User, Group, Channel, Message

### Routes
- `/login`: Displays the login page.
- `/groups`: Displays the groups the user is a member of.
- `/channels/:groupId`: Displays the channels within a group.
- `/chat/:channelId`: Displays the chat interface for a channel.
- `/admin`: Displays the admin dashboard for Super Admins and Group Admins.

### Node Server Architecture
**Modules**:
- `auth.js`
- `groups.js`
- `channels.js`
- `chat.js`
- `admin.js`
- `messages.js`

**Functions**:
- `login`
- `register`
- `createGroup`
- `deleteGroup`
- `createChannel`
- `deleteChannel`
- `sendMessage`
- `promoteUser`

**Files**:
- `server.js`: Entry point of the Node.js application.
- `routes/`: Contains route handlers for different functionalities.
- `models/`: Contains Mongoose models (for the second phase).

**Global Variables**:
- `io` (socket.io instance)
- `peerServer` (Peer.js server instance)

### Server-Side Routes
- `POST /login`: Authenticates a user. Returns a token.
- `POST /register`: Registers a new user.
- `POST /api/channels/join`: Joins a channel.
- `GET /api/channels`: Retrieves channels for a group.
- `DELETE /api/channels/delete/:id`: Deletes a channel.
- `POST /requestJoin`: Requests to join a group.
- `POST /api/groups/approve-request`: Approves a user's request to join a group.
- `POST /api/groups/remove-from-requests`: Removes a user from a group's requests.
- `GET /api/user/requested-groups`: Retrieves the groups a user has requested to join.
- `POST /join-group`: Joins a group.
- `POST /joinChannel`: Joins a channel.
- `POST /create-group`: Creates a new group.
- `POST /create-channel`: Creates a new channel.
- `GET /groups`: Retrieves all groups.
- `DELETE /api/users/deleteAccount/:id`: Deletes a user account.
- `DELETE /api/users/deleteUser/:username`: Deletes a user by username.
- `PATCH /api/users/promote/:id`: Promotes a user to Group Admin or Super Admin.
- `PATCH /api/users/demote/:id`: Demotes a user.
- `GET /api/users`: Retrieves all users.

# Testing

## Front-End Testing with Cypress
For front-end testing, **Cypress** was used to ensure that the Angular components and user flows function as expected.

### Running the Tests
To run the Cypress tests, follow these steps:

1. Ensure that you are in the `client/` folder:
cd client
   

2. Install the Cypress testing framework (if not already installed):
npm install cypress --save-dev


3. Open Cypress and run the tests:
npx cypress open



This will open the Cypress Test Runner, where you can see and execute the test cases.

### Cypress Test Coverage
The following components and user flows are tested using Cypress:
- **User Authentication**: Tests ensure that users can register, log in, and log out.
- **Group Management**: Admins can create, delete, and manage groups.
- **Channel Management**: Admins can create, delete, and manage channels within a group.
- **Messaging**: Tests cover the sending and receiving of messages in real-time.
- **Join Requests**: Tests for group join requests and admin approvals.

Cypress provides a visual test runner that allows you to view each test case and its results in real-time. This helps verify that the application is working correctly during development and after any code changes.

## Back-End Testing with Mocha and Chai
**Mocha** and **Chai** are used for testing the server-side routes and functionalities.

### Running the Tests
To run the Mocha tests, follow these steps:

1. Navigate to the server directory:
  cd server

3. Ensure Mocha and Chai are installed:
  npm install mocha chai --save-dev
  
3. Run the tests:
  npx mocha test/**/*.test.js

## Test Structure

The tests are organized in the `test` directory and cover the following routes and functionalities:

### User Authentication
- Tests for registering, logging in, and validating user tokens.

### Group Management
- Tests for creating, retrieving, and deleting groups.

### Channel Management
- Tests for creating, retrieving, and deleting channels.

### Message Sending
- Tests for sending and retrieving messages in channels.

## Testing Guidelines
- Each route should have at least two passing tests: one for a successful request and one for failure (e.g., unauthorized access).
- Regularly run tests after implementing new features to ensure existing functionality remains unaffected.

## Installation

### Clone the Repository
Clone the repository:

git clone <repository-url>
cd chat-system

## Install Dependencies
Navigate to the client and server directories and install dependencies:
cd client
npm install
cd ../server
npm install

## Run the Server
Run the server:
node server.js

## Run the Angular Application
Run the Angular application:
cd client
ng serve

Access the application at [http://localhost:4200](http://localhost:4200).

# Contributing
Contributions are welcome! Please open an issue or submit a pull request for any changes or improvements.

# License
This project is licensed under the MIT License. See the LICENSE file for details.
