import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize or get existing Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with Chat scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/chat.spaces');
provider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
provider.addScope('https://www.googleapis.com/auth/chat.spaces.create');
provider.addScope('https://www.googleapis.com/auth/chat.messages');
provider.addScope('https://www.googleapis.com/auth/chat.messages.create');
provider.addScope('https://www.googleapis.com/auth/chat.messages.readonly');
provider.addScope('https://www.googleapis.com/auth/chat.memberships.readonly');

// In-memory token management
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface GoogleChatSpace {
  name: string; // e.g., 'spaces/AAAAAAAAAAA'
  type: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  displayName?: string;
  spaceType?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  spaceDetails?: {
    description?: string;
    guidelines?: string;
  };
  singleUserBotDm?: boolean;
  threaded?: boolean;
}

export interface GoogleChatMessage {
  name: string; // e.g. 'spaces/.../messages/...'
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
  createTime?: string;
  text?: string;
  formattedText?: string;
  cardsV2?: any[];
  thread?: {
    name?: string;
  };
}

/**
 * Initialize auth listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Google Sign In with Chat Scopes
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Chat icazəsi üçün Access Token alına bilmədi.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Chat sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogleChat = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/* =========================================================================
   Google Chat REST API Endpoints
   ========================================================================= */

/**
 * List Google Chat Spaces accessible by the authenticated user
 */
export async function listGoogleChatSpaces(token: string): Promise<GoogleChatSpace[]> {
  const response = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=50', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Google Chat kanallarını yükləmək mümkün olmadı (${response.status})`
    );
  }

  const data = await response.json();
  return data.spaces || [];
}

/**
 * Create a new Google Chat Space (Room)
 */
export async function createGoogleChatSpace(
  token: string,
  displayName: string,
  description?: string
): Promise<GoogleChatSpace> {
  const response = await fetch('https://chat.googleapis.com/v1/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      spaceType: 'SPACE',
      displayName: displayName.trim(),
      spaceDetails: description ? { description: description.trim() } : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Yeni Google Chat otağı yaratmaq mümkün olmadı (${response.status})`
    );
  }

  return await response.json();
}

/**
 * List messages in a space
 */
export async function listGoogleChatMessages(
  token: string,
  spaceName: string,
  pageSize = 30
): Promise<GoogleChatMessage[]> {
  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(
    `https://chat.googleapis.com/v1/${cleanSpaceName}/messages?pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Mesajları yükləmək mümkün olmadı (${response.status})`
    );
  }

  const data = await response.json();
  // Messages are returned in chronological order or reverse; normalize for display
  const messages: GoogleChatMessage[] = data.messages || [];
  return messages.reverse(); // oldest first for standard chat stream
}

/**
 * Send a message into a Google Chat space
 */
export async function sendGoogleChatMessage(
  token: string,
  spaceName: string,
  text: string
): Promise<GoogleChatMessage> {
  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(`https://chat.googleapis.com/v1/${cleanSpaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Mesaj göndərilmədi (${response.status})`
    );
  }

  return await response.json();
}
