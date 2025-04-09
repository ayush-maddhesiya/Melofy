import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: { type: String, default: 'default-playlist.png' },
  description: { type: String, default: '' },
  songs: [{ 
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    addedAt: { type: Date, default: Date.now }
  }],
  isPublic: { type: Boolean, default: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: { type: Number, default: 0 },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Playlist = mongoose.model('Playlist', PlaylistSchema);
export default Playlist;