# Guide

## Authentication Controllers

- **registerController**
- **loginController**
- **oauthGoogleController**
- **oauthGithubController**
- **refreshTokenController**
- **logoutController**
- **forgotPasswordController**
- **resetPasswordController**

## User Controllers

- **getUserProfileController**
- **updateUserProfileController**
- **followUserController**
- **unfollowUserController**
- **getFollowersController**
- **getFollowingController**
- **getUserPreferencesController**
- **updateUserPreferencesController**
- **getUserActivitiesController**
- **togglePremiumStatusController**

## Song Controllers

- **uploadSongController**
- **getSongDetailsController**
- **updateSongDetailsController**
- **deleteSongController**
- **streamSongController**
- **downloadSongController**
- **likeSongController**
- **unlikeSongController**
- **getLikedSongsController**
- **getSongsByGenreController**
- **getSongsByArtistController**
- **incrementPlayCountController**
- **searchSongsController**
- **getRecentlyPlayedController**
- **addToRecentlyPlayedController**

## Album Controllers

- **createAlbumController**
- **getAlbumDetailsController**
- **updateAlbumController**
- **deleteAlbumController**
- **addSongToAlbumController**
- **removeSongFromAlbumController**
- **likeAlbumController**
- **unlikeAlbumController**
- **getAlbumsByArtistController**

## Playlist Controllers

- **createPlaylistController**
- **getPlaylistDetailsController**
- **updatePlaylistController**
- **deletePlaylistController**
- **addSongToPlaylistController**
- **removeSongFromPlaylistController**
- **getUserPlaylistsController**
- **getPublicPlaylistsController**
- **followPlaylistController**
- **unfollowPlaylistController**
- **likePlaylistController**
- **unlikePlaylistController**
- **addCollaboratorController**
- **removeCollaboratorController**

## Comment Controllers

- **addCommentController**
- **getCommentsForSongController**
- **updateCommentController**
- **deleteCommentController**
- **likeCommentController**
- **replyToCommentController**

## Listening Room Controllers

- **createRoomController**
- **getRoomDetailsController**
- **joinRoomController**
- **leaveRoomController**
- **updateRoomDetailsController**
- **deleteRoomController**
- **addSongToQueueController**
- **removeSongFromQueueController**
- **playNextSongController**
- **updatePlaybackStatusController**
- **sendChatMessageController**
- **getRoomChatController**
- **changeUserRoleController**
- **kickUserController**
- **getActiveRoomsController**

## Recommendation Controllers

- **getRecommendedSongsController**
- **getRecommendedArtistsController**
- **getRecommendedPlaylistsController**
- **getRecommendedByGenreController**
- **getRecommendedByMoodController**
- **getPopularSongsController**
- **getTrendingSongsController**
- **getNewReleasesController**

## Notification Controllers

- **getUserNotificationsController**
- **markNotificationAsReadController**
- **deleteNotificationController**
- **getUnreadNotificationCountController**

## Search Controllers

- **globalSearchController**
- **filterSearchResultsController**
- **advancedSearchController**

## Admin Controllers

- **getAllUsersController**
- **manageUserRolesController**
- **getSystemStatsController**
- **moderateContentController**

---

## Design Considerations

### User Roles
The schema distinguishes between regular users, artists, and admins, allowing for different permissions and features.

### File Storage
The Song schema is designed to work with both the original file and chunked versions for efficient streaming.

### Real-time Sync Listening
The ListeningRoom schema supports room management, participant roles, playback synchronization, and chat functionality.

### Recommendation System
The Activity schema tracks user interactions (plays, likes, etc.) to power the recommendation engine.

### Social Features
Schemas support following artists/users, collaborating on playlists, and interacting through comments.

### Premium Features
Fields like `premiumOnly` on songs and `premiumMember` on users allow you to gate certain content or features.

### OAuth Integration
The User schema supports multiple authentication methods for when you implement Google and GitHub login.

### Scalability
- References between collections are used to maintain data relationships while avoiding embedding large arrays.

### Performance Optimization
- Used indexes on frequently queried fields.
- Limited the size of embedded arrays.
- Used references for collections that might grow large.

### Extensibility
The schemas include fields for future features like mood-based recommendations and comments.