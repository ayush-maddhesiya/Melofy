import mongoose,{Schema} from 'mongoose';

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featuredArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  duration: { type: Number, required: true }, // in seconds
  releaseDate: { type: Date, default: Date.now },
  genre: [{ type: String, required: true }],
  coverImage: { type: String, required: true },
  audioFile: { type: String, required: true }, // URL to original file
  chunks: [{ 
    index: { type: Number },
    url: { type: String }
  }], // For streaming in chunks
  downloadable: { type: Boolean, default: true },
  premiumOnly: { type: Boolean, default: false },
  lyrics: { type: String, default: '' },
  tags: [String],
  playCount: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  isExplicit: { type: Boolean, default: false },
  mood: [String], // For recommendation system
  language: { type: String },
  metaData: {
    bpm: { type: Number },
    key: { type: String },
    recordLabel: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Song = mongoose.model('Song', SongSchema);
export default Song;