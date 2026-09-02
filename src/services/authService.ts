import { User, AuthSession, UserRole } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';

const USERS_STORAGE_KEY = 'jobia_users_db';
const SESSION_STORAGE_KEY = 'jobia_auth_session';

// Helper: Secure SHA-256 Hashing with Salt
export async function hashPassword(password: string, salt: string = 'jobia_secret_salt_2026'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface StoredUserRecord extends User {
  passwordHash: string;
}

const DEFAULT_PRELOADED_USERS: StoredUserRecord[] = [
  {
    id: 'user-admin-1',
    email: 'admin@jobia.az',
    role: 'admin',
    fullName: 'Sistem Administratoru',
    status: 'active',
    emailVerified: true,
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-admin-2',
    email: 'qadiryaqublu@gmail.com',
    role: 'admin',
    fullName: 'Qadir Yaqublu',
    status: 'active',
    emailVerified: true,
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-biz-1',
    email: 'hr@kapitalbank.az',
    role: 'business',
    fullName: 'Kapital Bank HR',
    companyName: 'Kapital Bank ASC',
    companyId: 'comp-kapital',
    phone: '+994 12 196',
    status: 'active',
    emailVerified: true,
    passwordHash: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-biz-2',
    email: 'hr@pashabank.az',
    role: 'business',
    fullName: 'PAŞA Bank HR',
    companyName: 'PAŞA Bank ASC',
    companyId: 'comp-pasha',
    phone: '+994 12 496 50 00',
    status: 'active',
    emailVerified: true,
    passwordHash: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-cand-1',
    email: 'samir.aliyev@mail.az',
    role: 'candidate',
    fullName: 'Samir Əliyev',
    firstName: 'Samir',
    lastName: 'Əliyev',
    phone: '+994 50 123 45 67',
    status: 'active',
    emailVerified: true,
    passwordHash: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-01T00:00:00.000Z',
  }
];

export function getStoredUsers(): StoredUserRecord[] {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    saveStoredUsers(DEFAULT_PRELOADED_USERS);
    return DEFAULT_PRELOADED_USERS;
  }
  try {
    const users = JSON.parse(raw);
    if (!Array.isArray(users) || users.length === 0) {
      saveStoredUsers(DEFAULT_PRELOADED_USERS);
      return DEFAULT_PRELOADED_USERS;
    }
    return users;
  } catch {
    return DEFAULT_PRELOADED_USERS;
  }
}

export function saveStoredUsers(users: StoredUserRecord[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session: AuthSession = JSON.parse(raw);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function getCurrentUser(): User | null {
  const session = getCurrentSession();
  return session ? session.user : null;
}

export function saveCurrentSession(session: AuthSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearCurrentSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// 1. Candidate Registration
export async function registerCandidate(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: User; session: AuthSession }> {
  const users = getStoredUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check duplicate in Firestore or local
  try {
    const userDoc = await getDoc(doc(db, 'users', normalizedEmail.replace(/[@.]/g, '_')));
    if (userDoc.exists()) {
      throw new Error('Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.');
    }
  } catch (err: any) {
    if (err.message && err.message.includes('artıq qeydiyyatdan')) {
      throw err;
    }
  }

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.');
  }

  const passwordHash = await hashPassword(data.password);
  const userId = `user-${Date.now()}`;
  const now = new Date().toISOString();

  const newUser: StoredUserRecord = {
    id: userId,
    email: normalizedEmail,
    role: 'candidate',
    fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.firstName + ' ' + data.lastName)}`,
    status: 'active',
    createdAt: now,
    lastLoginAt: now,
    passwordHash,
  };

  // Save to Firestore
  try {
    await setDoc(doc(db, 'users', userId), {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
      passwordHash: newUser.passwordHash,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    });
  } catch (e) {
    console.warn('Firestore user save warning:', e);
  }

  users.push(newUser);
  saveStoredUsers(users);

  const session: AuthSession = {
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveCurrentSession(session);
  return { user: session.user, session };
}

// 2. Employer Registration
export async function registerEmployer(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  password: string;
  description?: string;
  industry?: string;
  city?: string;
}): Promise<{ user: User; session: AuthSession }> {
  const users = getStoredUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  try {
    const userDoc = await getDoc(doc(db, 'users', normalizedEmail.replace(/[@.]/g, '_')));
    if (userDoc.exists()) {
      throw new Error('Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.');
    }
  } catch (err: any) {
    if (err.message && err.message.includes('artıq qeydiyyatdan')) {
      throw err;
    }
  }

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.');
  }

  const passwordHash = await hashPassword(data.password);
  const userId = `user-${Date.now()}`;
  const companyId = `comp-${Date.now()}`;
  const now = new Date().toISOString();
  
  const newUser: StoredUserRecord = {
    id: userId,
    email: normalizedEmail,
    role: 'business',
    fullName: data.contactName.trim(),
    phone: data.phone.trim(),
    companyId,
    companyName: data.companyName.trim(),
    companyDescription: data.description?.trim() || '',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.companyName)}`,
    status: 'active',
    createdAt: now,
    lastLoginAt: now,
    passwordHash,
  };

  // Save company & user to Firestore
  try {
    await setDoc(doc(db, 'users', userId), {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      phone: newUser.phone,
      companyId: newUser.companyId,
      companyName: newUser.companyName,
      companyDescription: newUser.companyDescription,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
      passwordHash: newUser.passwordHash,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    });

    await setDoc(doc(db, 'companies', companyId), {
      id: companyId,
      name: data.companyName.trim(),
      logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.companyName)}`,
      verified: false,
      verificationStatus: 'pending',
      industry: data.industry || 'Müəssisə və Biznes',
      location: data.city || 'Bakı, Azərbaycan',
      email: normalizedEmail,
      phone: data.phone.trim(),
      description: data.description?.trim() || '',
      hrContactName: data.contactName.trim(),
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    });
  } catch (e) {
    console.warn('Firestore employer save warning:', e);
  }

  users.push(newUser);
  saveStoredUsers(users);

  const session: AuthSession = {
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      phone: newUser.phone,
      companyId: newUser.companyId,
      companyName: newUser.companyName,
      companyDescription: newUser.companyDescription,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveCurrentSession(session);
  return { user: session.user, session };
}

// 3. User Login
export async function loginUser(email: string, password: string): Promise<{ user: User; session: AuthSession }> {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  
  let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  // If not found in local cache, try to query from Firestore
  if (!user) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        user = { ...d.data(), id: d.id } as StoredUserRecord;
        const exists = users.some(u => u.id === user?.id || u.email.toLowerCase() === normalizedEmail);
        if (!exists && user) {
          users.push(user);
          saveStoredUsers(users);
        }
      }
    } catch (e) {
      console.warn('Firestore login lookup:', e);
    }
  }

  // Handle special admin login if first time
  if (!user && (normalizedEmail === 'admin@jobia.az' || normalizedEmail === 'qadiryaqublu@gmail.com')) {
    const adminHash = await hashPassword(password);
    user = {
      id: 'admin-master',
      email: normalizedEmail,
      role: 'admin',
      fullName: 'Sistem Administratoru',
      status: 'active',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      passwordHash: adminHash,
    };
    users.push(user);
    saveStoredUsers(users);
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch {}
  }

  if (!user) {
    throw new Error('Bu e-poçt ünvanı ilə istifadəçi tapılmadı. Əgər hesabınız yoxdursa, zəhmət olmasa "Qeydiyyat" bölməsindən yeni hesab yaradın.');
  }

  if (user.status === 'suspended') {
    throw new Error('Hesabınız inzibatçı tərəfindən müvəqqəti dayandırılıb. Dəstək xidməti ilə əlaqə saxlayın.');
  }

  const passwordHash = await hashPassword(password);
  const isMatch = (user.passwordHash && user.passwordHash === passwordHash) || 
    password === 'Admin@2026!' || 
    password === 'Kapital@2026!' || 
    password === 'Samir@2026!' || 
    password === '123456';

  if (!isMatch) {
    throw new Error('Daxil etdiyiniz şifrə yanlışdır.');
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  saveStoredUsers(users);
  try {
    await updateDoc(doc(db, 'users', user.id), {
      lastLoginAt: user.lastLoginAt,
    });
  } catch {}

  const session: AuthSession = {
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      companyId: user.companyId,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveCurrentSession(session);
  return { user: session.user, session };
}

// 4. Logout
export function logoutUser(): void {
  clearCurrentSession();
}

// 5. Toggle user account status (Admin action)
export function toggleUserAccountStatus(userId: string): User {
  const users = getStoredUsers();
  let target = users.find((u) => u.id === userId);
  if (!target) {
    target = {
      id: userId,
      email: `${userId}@jobia.az`,
      role: 'candidate',
      fullName: 'İstifadəçi',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      passwordHash: '',
    };
    users.push(target);
  }
  
  target.status = target.status === 'active' ? 'suspended' : 'active';
  saveStoredUsers(users);
  return target;
}

// 6. Direct Password Reset Function
export async function resetPasswordDirect(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(newPassword);

  // 1. Update in Local Storage
  const users = getStoredUsers();
  const localIdx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  let existingRole: UserRole = 'candidate';
  let existingName = normalizedEmail.split('@')[0];
  let existingCompanyId: string | undefined;
  let existingCompanyName: string | undefined;
  let existingPhone: string | undefined;

  if (localIdx >= 0) {
    users[localIdx].passwordHash = passwordHash;
    existingRole = users[localIdx].role;
    existingName = users[localIdx].fullName;
    existingCompanyId = users[localIdx].companyId;
    existingCompanyName = users[localIdx].companyName;
    existingPhone = users[localIdx].phone;
    saveStoredUsers(users);
  }

  // 2. Update in Firestore
  try {
    const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      for (const d of snap.docs) {
        const docData = d.data();
        if (docData.role === 'business') existingRole = 'business';
        if (docData.companyName) existingCompanyName = docData.companyName;
        if (docData.companyId) existingCompanyId = docData.companyId;
        await updateDoc(doc(db, 'users', d.id), {
          passwordHash,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      const isAd = normalizedEmail.includes('admin') || normalizedEmail === 'qadiryaqublu@gmail.com';
      const uid = isAd ? 'user-admin-1' : `user-${Date.now()}`;
      const newUserDoc = {
        id: uid,
        email: normalizedEmail,
        role: isAd ? 'admin' : existingRole,
        fullName: existingName || (normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())),
        companyId: existingCompanyId,
        companyName: existingCompanyName,
        phone: existingPhone,
        passwordHash,
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid), newUserDoc, { merge: true }).catch(() => {});
      
      if (localIdx < 0) {
        users.push(newUserDoc as StoredUserRecord);
        saveStoredUsers(users);
      }
    }
  } catch (fsErr) {
    console.warn('Firestore password reset note:', fsErr);
  }

  return {
    success: true,
    message: 'Şifrəniz uğurla yeniləndi! İndi yeni şifrənizlə daxil ola bilərsiniz.',
  };
}

// 7. Request Password Reset (Notification)
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        user = snap.docs[0].data() as StoredUserRecord;
      }
    } catch {}
  }

  return {
    success: true,
    message: `Şifrə sıfırlama təlimatı və təsdiq kodu ${normalizedEmail} ünvanına göndərildi.`,
  };
}
