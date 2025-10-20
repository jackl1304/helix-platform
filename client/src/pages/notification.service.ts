import { db } from '../db/drizzle.js';
import { notifications } from '../../shared/schema.js';
import { nanoid } from 'nanoid';

interface CreateNotificationParams {
    userId: string;
    projectId: string;
    message: string;
    link: string;
}

export const notificationService = {
    async createNotification({ userId, projectId, message, link }: CreateNotificationParams): Promise<void> {
        try {
            await db.insert(notifications).values({
                id: nanoid(),
                userId,
                projectId,
                message,
                link,
                isRead: false,
            });
            console.log(`Notification created for user ${userId} for project ${projectId}`);
        } catch (error) {
            console.error('Error creating notification:', error);
            // We don't throw an error here to not interrupt the main process (e.g., document linking)
        }
    }
};
