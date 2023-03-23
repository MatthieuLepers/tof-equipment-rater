export interface IRateJob {
  fileUrl: string;
  authorId: string;
  channelId: string;
  messageId: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
