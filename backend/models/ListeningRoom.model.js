import mongoose from 'mongoose';

const ListeningRoomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  password: { type: String }, // Optional: for private rooms
  currentSong: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  queue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['host', 'dj', 'listener'], default: 'listener' }
  }],
  playbackStatus: { 
    isPlaying: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 }, // in seconds
    lastUpdateTime: { type: Date, default: Date.now }
  },
  chatHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  maxParticipants: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const ListeningRoom = mongoose.model('ListeningRoom', ListeningRoomSchema);
export default ListeningRoom;
