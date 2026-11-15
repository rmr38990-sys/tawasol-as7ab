import { CustomFeature, PostItem, UserAccount } from '../types';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzmKOVaGlbTFiCSYR0m0NzWpESdgjHK-ZUj-wCzKC-zV0Z4XEPlNSx8Uc6OAxdIC3o4Ag/exec';

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Tawasol (تواصل) — Google Sheets Live Database Web App
 * الخطوات:
 * 1. افتح جدول بيانات Google Sheets جديد أو حالي
 * 2. من القائمة العلوية اختر: الإضافات (Extensions) > Apps Script
 * 3. امسح الكود الموجود والصق هذا الكود بالكامل ثم اضغط حفظ (Save)
 * 4. اضغط نشر (Deploy) > نشر جديد (New deployment) > تطبيق ويب (Web app)
 * 5. اختر Execute as: Me ، و Who has access: Anyone
 * 6. انسخ رابط Web App URL وضعه في إعدادات قاعدة البيانات داخل موقع تواصل
 */

const SHEET_TABS = {
  USERS: 'Users',
  POSTS: 'Posts',
  INTERACTIONS: 'Interactions',
  FEATURES: 'CustomFeatures',
};

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = getOrCreateSheet(ss, SHEET_TABS.USERS, [
    'ID', 'Name', 'Contact', 'ContactType', 'PasswordHash', 'DOB', 'Gender', 'City', 'Bio', 'CreatedAt'
  ]);
  const postsSheet = getOrCreateSheet(ss, SHEET_TABS.POSTS, [
    'ID', 'AuthorID', 'AuthorName', 'Content', 'Privacy', 'Feeling', 'SharesCount', 'CreatedAt', 'JSONData'
  ]);
  const interactionsSheet = getOrCreateSheet(ss, SHEET_TABS.INTERACTIONS, [
    'PostID', 'Type', 'ActorID', 'ActorName', 'Value', 'CreatedAt'
  ]);
  const featuresSheet = getOrCreateSheet(ss, SHEET_TABS.FEATURES, [
    'ID', 'Type', 'TitleAR', 'TitleEN', 'AccentColor', 'IsEnabled', 'CreatedAt', 'JSONData'
  ]);
  return { ss, usersSheet, postsSheet, interactionsSheet, featuresSheet };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    const { usersSheet, postsSheet, featuresSheet } = setupDatabase();

    if (action === 'ping') {
      return jsonResponse({ ok: true, message: 'Tawasol Google Sheets API is active' });
    }

    if (action === 'getAll') {
      const usersRows = usersSheet.getDataRange().getValues().slice(1);
      const postsRows = postsSheet.getDataRange().getValues().slice(1);
      const featuresRows = featuresSheet.getDataRange().getValues().slice(1);

      const users = usersRows
        .filter(r => r[0])
        .map(r => ({
          id: String(r[0]),
          name: String(r[1]),
          contact: String(r[2]),
          contactType: String(r[3]) === 'phone' ? 'phone' : 'email',
          passwordHash: String(r[4]),
          dob: String(r[5]),
          gender: String(r[6]) || 'male',
          city: String(r[7]) || '',
          bio: String(r[8]) || '',
          createdAt: String(r[9]) || new Date().toISOString(),
          work: 'عضو في تواصل',
          followersCount: 0,
          friendsIds: [],
          isOnline: true
        }));

      const posts = postsRows
        .filter(r => r[0])
        .map(r => {
          try {
            if (r[8]) return JSON.parse(r[8]);
          } catch (err) {}
          return {
            id: String(r[0]),
            authorId: String(r[1]),
            authorName: String(r[2]),
            content: String(r[3]),
            privacy: String(r[4]) || 'public',
            feeling: String(r[5]) || undefined,
            sharesCount: Number(r[6]) || 0,
            createdAt: String(r[7]) || new Date().toISOString(),
            reactions: {},
            comments: []
          };
        });

      const customFeatures = featuresRows
        .filter(r => r[0])
        .map(r => {
          try {
            if (r[7]) return JSON.parse(r[7]);
          } catch (err) {}
          return null;
        })
        .filter(Boolean);

      return jsonResponse({ ok: true, users, posts, customFeatures });
    }

    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action || 'syncAll';
    const { usersSheet, postsSheet, interactionsSheet, featuresSheet } = setupDatabase();

    if (action === 'addUser' && body.user) {
      const u = body.user;
      usersSheet.appendRow([
        u.id, u.name, u.contact, u.contactType, u.passwordHash, u.dob, u.gender, u.city || '', u.bio || '', u.createdAt
      ]);
      return jsonResponse({ ok: true, action: 'addUser' });
    }

    if (action === 'addPost' && body.post) {
      const p = body.post;
      postsSheet.appendRow([
        p.id, p.authorId, p.authorName, p.content, p.privacy, p.feeling || '', p.sharesCount || 0, p.createdAt, JSON.stringify(p)
      ]);
      return jsonResponse({ ok: true, action: 'addPost' });
    }

    if (action === 'addInteraction' && body.interaction) {
      const it = body.interaction;
      interactionsSheet.appendRow([
        it.postId, it.type, it.actorId, it.actorName, it.value, it.createdAt
      ]);
      return jsonResponse({ ok: true, action: 'addInteraction' });
    }

    if (action === 'syncAll') {
      const users = body.users || [];
      const posts = body.posts || [];
      const features = body.customFeatures || [];

      if (usersSheet.getLastRow() > 1) {
        usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, usersSheet.getLastColumn()).clearContent();
      }
      users.forEach(u => {
        usersSheet.appendRow([
          u.id, u.name, u.contact, u.contactType, u.passwordHash, u.dob, u.gender, u.city || '', u.bio || '', u.createdAt
        ]);
      });

      if (postsSheet.getLastRow() > 1) {
        postsSheet.getRange(2, 1, postsSheet.getLastRow() - 1, postsSheet.getLastColumn()).clearContent();
      }
      if (interactionsSheet.getLastRow() > 1) {
        interactionsSheet.getRange(2, 1, interactionsSheet.getLastRow() - 1, interactionsSheet.getLastColumn()).clearContent();
      }
      posts.forEach(p => {
        postsSheet.appendRow([
          p.id, p.authorId, p.authorName, p.content, p.privacy, p.feeling || '', p.sharesCount || 0, p.createdAt, JSON.stringify(p)
        ]);
        const reactions = p.reactions || {};
        Object.keys(reactions).forEach(uid => {
          interactionsSheet.appendRow([p.id, 'reaction', uid, uid, reactions[uid], p.createdAt]);
        });
        (p.comments || []).forEach(c => {
          interactionsSheet.appendRow([p.id, 'comment', c.authorId, c.authorName, c.text, c.createdAt]);
        });
      });

      if (featuresSheet.getLastRow() > 1) {
        featuresSheet.getRange(2, 1, featuresSheet.getLastRow() - 1, featuresSheet.getLastColumn()).clearContent();
      }
      features.forEach(f => {
        featuresSheet.appendRow([
          f.id, f.type, f.titleAr, f.titleEn, f.accentColor, String(f.isEnabled), f.createdAt, JSON.stringify(f)
        ]);
      });

      return jsonResponse({ ok: true, action: 'syncAll', syncedAt: new Date().toISOString() });
    }

    return jsonResponse({ ok: false, error: 'Unsupported action' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}
`;

export async function pingAppsScript(url: string): Promise<{ ok: boolean; message?: string }> {
  const separator = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${separator}action=ping`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function pullFromAppsScript(url: string): Promise<{
  ok: boolean;
  users?: UserAccount[];
  posts?: PostItem[];
  customFeatures?: CustomFeature[];
}> {
  const separator = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${separator}action=getAll`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function postToAppsScript(
  url: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
