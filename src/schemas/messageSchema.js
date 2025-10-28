import mongoose, { Schema } from "mongoose";

export const schema = new Schema(
  {
    sender: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    message: { type: String },
    seen: [{ type: Schema.ObjectId, required: true, default: [] }],
    readTime: { type: Date },
    replays: [
      { type: Schema.ObjectId, ref: "Message", required: true, default: [] },
    ],
    roomID: { type: Schema.ObjectId, ref: "Room", required: true },
    replayedTo: {
      type: { message: String, msgID: String, username: String } || null,
      default: null,
    },
    isEdited: { type: Boolean, default: false },
    hideFor: [{ type: Schema.ObjectId, ref: "User", default: [] }],
    pinnedAt: { type: String || null, default: null },
    voiceData: {
      type: {
        src: { type: String, required: true },
        duration: { type: Number, required: true },
        playedBy: [{ type: String }],
      },
      default: null,
    },
    fileData: {
      type: {
        name: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number, required: true },
        url: { type: String, required: true },
        public_id: { type: String },
        resource_type: { type: String },
        format: { type: String },
        duration: { type: Number }, // للملفات الصوتية والفيديو
      },
      default: null,
    },
    tempID: { type: String, unique: true },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "sent",
    },
  },
  { timestamps: true, strictPopulate: false }
);

const MessageSchema =
  mongoose.models.Message || mongoose.model("Message", schema);
export default MessageSchema;
