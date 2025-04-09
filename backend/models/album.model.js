import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: { type: String, required: true },
  releaseDate: { type: Date, default: Date.now },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  genre: [String],
  description: { type: String },
  type: { type: String, enum: ['album', 'single', 'EP'], default: 'album' },
  likes: { type: Number, default: 0 },
  playCount: { type: Number, default: 0 },
  isExplicit: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Album = mongoose.model('Album', AlbumSchema);
export default Album;
