import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CustomFeature, PostItem, UserAccount } from '../types';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((s) => provider.addScope(s));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user && cachedAccessToken) {
      onAuthSuccess?.(user, cachedAccessToken);
    } else if (!isSigningIn) {
      if (!user) cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleSignInForSheets = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google Sheets access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => cachedAccessToken;

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export async function hashPassword(plain: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`tawasol::${plain}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return btoa(unescape(encodeURIComponent(`tawasol::${plain}`)));
  }
}

async function sheetsFetch(url: string, options: RequestInit = {}) {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google Sheets session expired. Please reconnect via Sign in with Google.');
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Sheets API (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function createTawasolSpreadsheet(): Promise<{
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  tabs: string[];
}> {
  const payload = {
    properties: {
      title: 'Tawasol Social Database — قاعدة بيانات تواصل',
    },
    sheets: [
      { properties: { title: 'Users' } },
      { properties: { title: 'Posts' } },
      { properties: { title: 'Interactions' } },
      { properties: { title: 'CustomFeatures' } },
    ],
  };

  const data = await sheetsFetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const spreadsheetId = data.spreadsheetId as string;
  const spreadsheetUrl = data.spreadsheetUrl as string;
  const tabs: string[] = (data.sheets || []).map((s: { properties: { title: string } }) => s.properties.title);

  // Initialize column headers cleanly
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'Users!A1:I1',
            values: [['ID', 'Name', 'Contact', 'Type', 'PasswordHash', 'DOB', 'Gender', 'City', 'CreatedAt']],
          },
          {
            range: 'Posts!A1:H1',
            values: [['ID', 'AuthorID', 'AuthorName', 'Content', 'Privacy', 'Feeling', 'Shares', 'CreatedAt']],
          },
          {
            range: 'Interactions!A1:F1',
            values: [['PostID', 'Type', 'ActorName', 'Value', 'CreatedAt', 'Summary']],
          },
          {
            range: 'CustomFeatures!A1:G1',
            values: [['ID', 'Type', 'TitleAR', 'TitleEN', 'Accent', 'Enabled', 'CreatedAt']],
          },
        ],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: data.properties?.title || 'Tawasol Social Database',
    tabs,
  };
}

export async function inspectSpreadsheet(spreadsheetId: string): Promise<{
  title: string;
  tabs: string[];
  spreadsheetUrl: string;
}> {
  const data = await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=properties.title,spreadsheetUrl,sheets.properties.title`
  );
  return {
    title: data.properties?.title || 'Tawasol Spreadsheet',
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    tabs: (data.sheets || []).map((s: { properties: { title: string } }) => s.properties.title),
  };
}

export async function ensureRequiredTabs(spreadsheetId: string, existingTabs: string[]): Promise<string[]> {
  const required = ['Users', 'Posts', 'Interactions', 'CustomFeatures'];
  const missing = required.filter((t) => !existingTabs.includes(t));
  if (missing.length > 0) {
    await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: missing.map((title) => ({
          addSheet: { properties: { title } },
        })),
      }),
    });
  }
  return [...existingTabs, ...missing];
}

export async function syncAllToGoogleSheets(
  spreadsheetId: string,
  users: UserAccount[],
  posts: PostItem[],
  features: CustomFeature[]
): Promise<void> {
  const meta = await inspectSpreadsheet(spreadsheetId);
  await ensureRequiredTabs(spreadsheetId, meta.tabs);

  const userRows = [
    ['ID', 'Name', 'Contact', 'Type', 'PasswordHash', 'DOB', 'Gender', 'City', 'CreatedAt'],
    ...users.map((u) => [
      u.id,
      u.name,
      u.contact,
      u.contactType,
      u.passwordHash,
      u.dob,
      u.gender,
      u.city,
      u.createdAt,
    ]),
  ];

  const postRows = [
    ['ID', 'AuthorID', 'AuthorName', 'Content', 'Privacy', 'Feeling', 'Shares', 'CreatedAt'],
    ...posts.map((p) => [
      p.id,
      p.authorId,
      p.authorName,
      p.content,
      p.privacy,
      p.feeling || '',
      String(p.sharesCount),
      p.createdAt,
    ]),
  ];

  const interactionRows: string[][] = [
    ['PostID', 'Type', 'ActorName', 'Value', 'CreatedAt', 'Summary'],
  ];
  posts.forEach((p) => {
    Object.entries(p.reactions).forEach(([uid, reaction]) => {
      interactionRows.push([p.id, 'reaction', uid, reaction, p.createdAt, `${uid} -> ${reaction}`]);
    });
    p.comments.forEach((c) => {
      interactionRows.push([p.id, 'comment', c.authorName, c.text, c.createdAt, c.text.slice(0, 60)]);
    });
  });

  const featureRows = [
    ['ID', 'Type', 'TitleAR', 'TitleEN', 'Accent', 'Enabled', 'CreatedAt'],
    ...features.map((f) => [
      f.id,
      f.type,
      f.titleAr,
      f.titleEn,
      f.accentColor,
      String(f.isEnabled),
      f.createdAt,
    ]),
  ];

  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`,
    {
      method: 'POST',
      body: JSON.stringify({
        ranges: ['Users!A1:I1000', 'Posts!A1:H1000', 'Interactions!A1:F1000', 'CustomFeatures!A1:G1000'],
      }),
    }
  );

  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'Users!A1', values: userRows },
          { range: 'Posts!A1', values: postRows },
          { range: 'Interactions!A1', values: interactionRows },
          { range: 'CustomFeatures!A1', values: featureRows },
        ],
      }),
    }
  );
}

export async function readSheetPreview(spreadsheetId: string, tabName: string): Promise<string[][]> {
  const data = await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${tabName}!A1:I30`)}`
  );
  return (data.values as string[][]) || [];
}
