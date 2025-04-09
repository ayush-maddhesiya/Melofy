import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['new_follower', 'new_song', 'playlist_add', 'comment', 'room_invite', 'mention', 'like'],
    required: true 
  },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'resourceModel' 
  },
  resourceModel: {
    type: String,
    enum: ['Song', 'Album', 'Playlist', 'Comment', 'User', 'ListeningRoom']
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;