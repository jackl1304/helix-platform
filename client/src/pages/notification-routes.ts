import { Router } from 'express';
import { db } from '../db/drizzle.js';
import { notifications } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications - Fetch notifications for the logged-in user
router.get('/', requireAuth, async (req, res) => {
  // @ts-ignore: req.user is populated by requireAuth middleware
  const userId = req.user.id;

  try {
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
      limit: 20, // Limit to the last 20 notifications for performance
    });
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications/read-all - Mark all notifications as read for the logged-in user
router.post('/read-all', requireAuth, async (req, res) => {
  // @ts-ignore: req.user is populated by requireAuth middleware
  const userId = req.user.id;

  try {
    await db.update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.userId, userId));

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error(`Error marking all notifications as read for user ${userId}:`, error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});


// POST /api/notifications/:id/read - Mark a notification as read
router.post('/:id/read', requireAuth, async (req, res) => {
  // @ts-ignore: req.user is populated by requireAuth middleware
  const userId = req.user.id;
  const notificationId = req.params.id;

  try {
    const result = await db.update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId) // Ensure user can only update their own notifications
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Notification not found or you do not have permission to update it.' });
    }

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
