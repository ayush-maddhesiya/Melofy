import mongoose ,{ Schema} from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String }, // Optional if using OAuth
  profileImage: { type: String, default: 'default-avatar.png' },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['user', 'artist', 'admin'], default: 'user' },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  likedAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
  likedPlaylists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  recentlyPlayed: [{
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    playedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    favoriteGenres: [String],
    theme: { type: String, default: 'light' },
    privacySettings: {
      showRecentlyPlayed: { type: Boolean, default: true },
      showPlaylists: { type: Boolean, default: true }
    }
  },
  premiumMember: { type: Boolean, default: false },
  authMethod: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
  authProviderId: { type: String }, // For OAuth users
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;