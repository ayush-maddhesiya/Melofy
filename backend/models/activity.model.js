import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['play', 'like', 'download', 'add_to_playlist', 'share', 'follow_artist', 'create_playlist'], 
    required: true 
  },
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number }, // For play activity, how long they listened
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });


const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;