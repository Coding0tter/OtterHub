import { model, Schema } from "mongoose";

const ImageCacheSchema = new Schema({
  imageUrl: { type: String, required: true },
  data: { type: Schema.Types.Buffer, required: true },
  contentType: { type: String, required: true },
  lastFetched: { type: Date, default: Date.now },
});

ImageCacheSchema.index({ lastFetched: 1 }, { expireAfterSeconds: 3600 });

export const ImageCache = model("ImageCache", ImageCacheSchema);
