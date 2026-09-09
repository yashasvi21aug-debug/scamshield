import mongoose from 'mongoose';

export const communityVoteSchemaDefinition = {
  voteId: { type: String, required: true, unique: true, index: true },
  reportId: { type: String, required: true, index: true },
  userSessionId: { type: String, required: true, index: true },
  votedAt: { type: Date, default: Date.now }
};

const CommunityVoteSchema = new mongoose.Schema(communityVoteSchemaDefinition, { timestamps: true });
CommunityVoteSchema.index({ reportId: 1, userSessionId: 1 }, { unique: true });

export const CommunityVote = mongoose.models.CommunityVote || mongoose.model('CommunityVote', CommunityVoteSchema);
export default CommunityVote;
