import express from 'express';
import { neon } from "@neondatabase/serverless";
import { PasswordUtils, InputSanitizer, authRateLimit } from '../middleware/security';
import { Logger } from '../services/logger.service';

const router = express.Router();
const sql = neon(process.env.DATABASE_URL!);
const logger = new Logger('TenantAuth');

/**
 * Sichere Tenant-Authentifizierung
 * Implementiert moderne Sicherheitsstandards
 */
router.post('/login', authRateLimit, async (req, res) => {
  try {
    let { email, password } = req.body;

    // Input Sanitization
    email = InputSanitizer.sanitizeEmail(email);
    password = InputSanitizer.sanitizeString(password);

    logger.info('Tenant login attempt', { email: email.substring(0, 3) + '***' });

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email und Passwort sind erforderlich' 
      });
    }

    // Demo tenant (für Entwicklung)
    const tenant = {
      id: '2d224347-b96e-4b61-acac-dbd414a0e048',
      name: 'Demo Medical Corp',
      subdomain: 'demo-medical',
      subscription_tier: 'professional'
    };

    // Sichere Benutzer-Authentifizierung
    let user;
    
  // Demo-Modus (nur für Entwicklung)
  if (process.env.NODE_ENV === 'development' && email === 'admin@demo-medical.local' && (password === 'demo1234' || password === 'demo123')) {
      user = {
        id: 'demo-user-001',
        email: 'admin@demo-medical.local',
        name: 'Demo Admin',
        role: 'admin',
        // Mindestlänge >= 8 Zeichen sicherstellen
        password_hash: await PasswordUtils.hashPassword('demo1234'),
        created_at: new Date()
      };
      logger.info('Demo user authenticated (development mode)');
    } else {
      // Produktions-Authentifizierung mit Datenbank
      const userResult = await sql`
        SELECT id, email, name, role, password_hash, created_at
        FROM users 
        WHERE email = ${email} AND tenant_id = ${tenant.id}
      `;

      user = userResult[0];
      
      if (!user) {
        logger.warn('Login attempt with non-existent user', { email: email.substring(0, 3) + '***' });
        return res.status(401).json({ 
          error: 'Ungültige Anmeldedaten' 
        });
      }

      // Passwort-Verifikation mit bcrypt
      const validPassword = await PasswordUtils.verifyPassword(password, user.password_hash);
      
      if (!validPassword) {
        logger.warn('Login attempt with invalid password', { email: email.substring(0, 3) + '***' });
        return res.status(401).json({ 
          error: 'Ungültige Anmeldedaten' 
        });
      }
    }

    // Update last login
    try {
      // Versuch 1: Mit last_login
      await sql`UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = ${user.id}`;
    } catch (e1) {
      try {
        // Versuch 2: Fallback ohne last_login (Spalte existiert nicht)
        await sql`UPDATE users SET updated_at = NOW() WHERE id = ${user.id}`;
      } catch (e2) {
        logger.warn('Failed to update last login time', { error: (e2 as Error).message });
      }
    }

    // Sichere Session erstellen
    const sessionUser = {
      id: user.id,
      tenantId: tenant.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    // Session speichern
    if (req.session) {
      req.session.user = sessionUser;
      req.session.tenant = tenant;
      req.session.save((err) => {
        if (err) {
          logger.error('Session save error', { error: err.message });
          return res.status(500).json({ error: 'Session-Fehler' });
        }
      });
    }

    logger.info('Successful tenant login', { userId: user.id, email: email.substring(0, 3) + '***' });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain
      }
    });

  } catch (error: any) {
    logger.error('Tenant login error', { error: error.message });
    return res.status(500).json({ 
      error: 'Interner Server-Fehler' 
    });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error', { error: err.message });
        return res.status(500).json({ error: 'Logout-Fehler' });
      }
      res.clearCookie('helix-session');
      return res.json({ success: true, message: 'Erfolgreich abgemeldet' });
    });
  } else {
    return res.json({ success: true, message: 'Erfolgreich abgemeldet' });
  }
});

// Passwort ändern
router.post('/change-password', authRateLimit, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Nicht authentifiziert' });
    }

    // Passwort-Stärke validieren
    const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Passwort entspricht nicht den Anforderungen',
        details: passwordValidation.errors
      });
    }

    // Aktuelles Passwort verifizieren
    const userResult = await sql`
      SELECT password_hash FROM users WHERE id = ${userId}
    `;
    
    if (!userResult[0]) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const validCurrentPassword = await PasswordUtils.verifyPassword(
      currentPassword, 
      userResult[0].password_hash
    );

    if (!validCurrentPassword) {
      return res.status(400).json({ error: 'Aktuelles Passwort ist falsch' });
    }

    // Neues Passwort hashen und speichern
    const newPasswordHash = await PasswordUtils.hashPassword(newPassword);
    
    await sql`
      UPDATE users 
      SET password_hash = ${newPasswordHash}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    logger.info('Password changed successfully', { userId });

    return res.json({ 
      success: true, 
      message: 'Passwort erfolgreich geändert' 
    });

  } catch (error: any) {
    logger.error('Password change error', { error: error.message });
    return res.status(500).json({ error: 'Interner Server-Fehler' });
  }
});

export default router;