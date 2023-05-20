# SoundSquad

#### Authors

Ángeles Figueredo

Pepe Alacid

### UX/UI team

Javier Vega

Cristina San Juan

Juanan Antona

## How it looks

![Screen_view_1](https://res.cloudinary.com/dioxc2frd/image/upload/v1684567599/preview1_olbzpa.jpg | width=100)

![Screen_view_2](https://res.cloudinary.com/dioxc2frd/image/upload/v1684567599/preview3_tifnam.jpg | width=100)

![Screen_view_3](https://res.cloudinary.com/dioxc2frd/image/upload/v1684567602/preview2_pshs41.jpg | width=100)

![Screen_view_4](https://res.cloudinary.com/dioxc2frd/image/upload/v1684567599/preview4_w7t018.jpg | width=100)

## Description

SoundSquad is a social network that will help you make teams so you don't go alone to see your favorite concerts. Also, it will allow you to update your friends on your musical concerns.

## MVP
Application that recognizes songs through the microphone and allows you to add them to a playlist.

## Built with

- Node.js
- Handlebars
- Express.js
- HTML
- CSS
- Boostrap
- Axios

## Used APIs

- TicketMaster API
- Spotify API
- AudD Music Recognition API
- Mapbox
- Socket.io
- MediaRecorder Video
- MediaRecorder Audio
- Cloudinary

## User Stories

- **Homepage** - As users, we need to log-in or sign up if we don't have an account.
- **For-you page** - A "feed" page where you will see your friends' post and yours posts too. Also, you could comment every post and mention your friends.
- **Profile page** - At this view, you will be able to access to your friend's playlists, their friends list, and their events. If it's your profile page, you will be able to edit your info too.
- **Playlist pages** You'll found a main playlists view, where you will find your or your friends' playlists named and, if you clic them, you'll see a detail page where you will be able to listen a preview os every song.
- **Listen! page** Let your phone recognize music for you! At this view, you will find that music that you love and that is playing on the radio, but that you do not know yet. When a song is found, you'll see the song details view.
- **Song details** There, you will see the song name, its author and the album where it belongs. Also, you will be able to listen a preview audio and to add it to any of your playlists.
- **Artist details** Another view for discovering. Here, you will find the artist's top songs, and the next concerts. 
- **Concert details** Here, you will see the show details like date, place... Also, you will see a link that will take you to the ticket sales page. And here, you will find a list of events related to the show, and the option of creating your own event. **This is the main functionality of the app**.
- **Event details** If you are owner or member of a concert's event, you'll find at its details page a live chat where you'll talk with your new (or not) friends, and you will prepare all the details for the concert. A great way for meeting people, isn't it?
- **DMs** You can talk to any user with direct messages too!
- **Notifications** Here, you will see the friendship requests, if a friend has shared an event with you that it thinks may interest you, a list of posts and comments mentions to yourself...

## Server Routes

This app has many routes, so we have grouped them into the following routers.

- **Index routes**: the main routes are here. Search bar logic, profiles, notifications.
- **AudD routes**: for all the recognizing stuff.
- **Auth routes**: for all credential related matters
- **Post routes**: creating, deleting, displaying, mentions at posts
- **Comment routes**: creating, deleting, displaying... comments
- **Events routes**: with the logic of creating an event, accepting an user to join an event...
- **Events' chat routes**: for the inside working of every single event chat, and the way of sharing events to your friends.
- **Messages routes**: for the DMs working.
- **Playlists routes**: here, you'll find the music things, like creating a playlist, taking a song...


Here, we show you some of that routes:

|     **Route**    | **HTTP Verb** |                     **Description**                    | **Request - body** |
|------------------|---------------|--------------------------------------------------------|--------------------|
|        `/`       |     `GET`     | First page, where you'll sign-up or login.             |                    |
|   `/home`        |     `GET`     | For you page, with your posts and your friends'        |                    |
|   `/my-profile`  |     `GET`     | Shows your info and the way for editing it             |                    |
|  `/notifications`|     `GET`     | Shows the notifications list of the user               |                    |
|   `/search`      |     `GET`     | Here, it will display whatever you search, it will connect with two APIs for giving info|Spotify: song and artist info. Ticketmaster: concerts info. SoundSquad: users, event...|
|   `/artist/:id`  |     `GET`     | Will ask for an artist info to Spotify                 |          query     |
|   `/concert/:id` |     `GET`     | Will ask for a concert info to Ticketmaster            |         query      |
|`/edit/:id`       |    `POST`     | This route updates your user's profile info            |  {name, lastName, age, profile image...}         |
|`/friend-requests/:id` |     `POST`| Finds the user you ask for friendship and push him your id, and you his one  |   {current user id, asked user id}    |
|`/unfollow/:id` |     `POST`    | Unfollow an user |{ user id, your id... }|
|`/song-details` |     `POST`     | Sends a base64 audio file to audD and returns the song's info | base64 audio file  |
|`/playlist-details/:id`|    `GET`     | Finds an user with his id, and show you his playlists. Also, it send the information of if you can follow that playlist or you follow it yet.      |                    |

## Scripts

We use Javascript scripts, for example, for:

- Live show and hide of password text.
- Change buttons appearance.
- Record audio
- Convert the taken audio to a base64 file
- Take a photo
- Push the photo to cloudinary
- Buttons for displaying more info at the search page


## Models

### User.model.js

```javascript

{
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
    },

    lastName: {
      type: String,
    },

    age: {
      type: Number,
    },

    profileImg: {
      type: String,
      default: "/images/user-icon.png",
    },

    role: {
      type: String,
      enum: ["STANDARD", "PREMIUM", "ADMIN"],
      default: "STANDARD",
      required: true,
    },

    description: {
      type: String,
    },

    interests: {
      type: ["String"],
      default: []
    },

    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],

    playlists: [{ type: Schema.Types.ObjectId, ref: "Playlist" }],

    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    eventsRequests: {
      type: [{ user: {type: String}, event: { type: String } }],
      default: []
    },

    postMentions: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    commentMentions: [{ type: Schema.Types.ObjectId, ref: "Comment" }],

    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],

    sentFriendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  }

  ```

### Post.model.js

```javascript
{
    author: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    content: String,
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
  }
  ```

### Comment.model.js
```javascript
{
    author: { type: Schema.Types.ObjectId, ref: "User" },
    content: String,
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    fatherPost: { type: Schema.Types.ObjectId, ref: "Post" },
  }
  ```

### Playlist.model.js
```javascript
{
    title: String,
    description: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    songs: [String],
    followers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    }}
```



### Events.model.js
```javascript
{
    name: String,
    author: { type: Schema.Types.ObjectId, ref: "User"},
    profilePic: {
      type: String,
      default: "/images/event-default.jpg"
    },
    admin: [{ type: Schema.Types.ObjectId, ref: "User"}],
    concertApiId: {
        type: String,
        }, 
    artist: String, 
    date: String, 
    place: String,
    description: String,
    members: [{type: Schema.Types.ObjectId, ref: "User" }], 
    joinRequests: [{type: Schema.Types.ObjectId, ref: "User" }], 
    messages:[{type: Schema.Types.ObjectId, ref: "Message"}]
  }
  ```

### Message.model.js
```javascript
{
    to: { type: Schema.Types.ObjectId, ref: "User" },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    content: String,
  }
  ```

  ### Conversation.model.js
```javascript
{
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  }
  ```

### Backlog

Implement the functionalities of:

- Send automatic emails when you edit your profile or when you register a user.

- Verify email when signing up

- Freemium and Premium that change the possibilities of action of each user

- Connect to the Genius API to return song lyrics.

- Use a map with markers showing the closest concerts.

### Links

#### Trello

[Link url](https://trello.com/b/MaED7yyT/proyecto-2)

#### Git

URls for the project repo and deploy
[Link Repo](https://github.com/AngelesFigueredo/shazam)

#### Slides

URls for the project presentation
[Link Canva](https://www.google.com)






