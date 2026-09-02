import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  increment,
  getDocFromServer 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  Vacancy, 
  Company, 
  Application, 
  JobOffer, 
  CandidateProfile, 
  AppNotification, 
  User,
  UserRole 
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Recursively remove `undefined` values and normalize objects for Firestore compatibility.
 * Firestore strictly rejects documents containing `undefined` values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return null as any;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString() as any;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as T;
}

/**
 * Test and validate connection to Firestore on initialization
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'platformSettings', 'health_check'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

/* ========================================================================= */
/* 1. REAL VACANCIES / JOBS FIRESTORE SERVICE                                */
/* ========================================================================= */

/**
 * Fetch all published vacancies for candidates and visitors
 */
export async function getPublishedVacancies(): Promise<Vacancy[]> {
  try {
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    return list;
  } catch (err) {
    console.error('Error fetching published jobs:', err);
    return [];
  }
}

/**
 * Realtime listener for published vacancies
 */
export function subscribeToPublishedVacancies(callback: (jobs: Vacancy[]) => void) {
  const q = query(
    collection(db, 'jobs'),
    where('status', '==', 'published')
  );
  return onSnapshot(q, (snap) => {
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    callback(list);
  }, (err) => {
    console.error('Snapshot error for published jobs:', err);
    callback([]);
  });
}

/**
 * Fetch company's own vacancies (for employer dashboard)
 */
export async function getCompanyVacancies(companyId: string): Promise<Vacancy[]> {
  if (!companyId) return [];
  try {
    const q = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    return list;
  } catch (err) {
    console.error('Error fetching company jobs:', err);
    return [];
  }
}

/**
 * Fetch all vacancies (for admin or search index)
 */
export async function getAllVacanciesFromFirestore(): Promise<Vacancy[]> {
  try {
    const snap = await getDocs(collection(db, 'jobs'));
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    return list;
  } catch (err) {
    console.error('Error fetching all jobs:', err);
    return [];
  }
}

/**
 * Realtime listener for all vacancies (for admin panel & instant cross-tab moderation sync)
 */
export function subscribeToAllVacancies(callback: (jobs: Vacancy[]) => void) {
  const q = collection(db, 'jobs');
  return onSnapshot(
    q,
    (snap) => {
      const list: Vacancy[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Vacancy);
      });
      callback(list);
    },
    (err) => {
      console.error('Snapshot error for all jobs:', err);
    }
  );
}

/**
 * Delete vacancy
 */
export async function deleteVacancyFromFirestore(jobId: string): Promise<void> {
  await deleteDoc(doc(db, 'jobs', jobId));
}

/**
 * Create or save new vacancy
 */
export async function saveVacancyToFirestore(job: Partial<Vacancy>, userId?: string): Promise<string> {
  const jobId = job.id || `job-${Date.now()}`;
  const now = new Date().toISOString();

  const rawRecord: Vacancy = {
    id: jobId,
    title: job.title || 'Vakansiya',
    department: job.department || '',
    category: job.category || 'İT və Proqramlaşdırma',
    companyId: job.companyId || '',
    companyName: job.companyName || '',
    companyLogo: job.companyLogo || '',
    companyVerified: job.companyVerified ?? false,
    city: job.city || 'Bakı',
    location: job.location || job.city || 'Bakı',
    address: job.address || '',
    metroStation: job.metroStation || '',
    latitude: job.latitude || 40.4093,
    longitude: job.longitude || 49.8671,
    workplaceType: job.workplaceType || 'on-site',
    employmentType: job.employmentType || 'Tam ştat',
    experienceLevel: job.experienceLevel || 'Orta (Mid-level, 1-3 il)',
    education: job.education || 'Ali',
    minSalary: job.minSalary ?? null as any,
    maxSalary: job.maxSalary ?? null as any,
    currency: job.currency || 'AZN',
    hideSalary: job.hideSalary ?? false,
    description: job.description || '',
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    benefits: job.benefits || [],
    skills: job.skills || [],
    postedDate: job.postedDate || now.split('T')[0],
    deadline: job.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: job.status || 'pending_review',
    isApproved: job.isApproved ?? false,
    editCount: job.editCount ?? 0,
    maxEditsAllowed: job.maxEditsAllowed ?? 1,
    lastEditedAt: job.lastEditedAt || null as any,
    rejectionReason: job.rejectionReason || null as any,
    isFeatured: job.isFeatured ?? false,
    viewsCount: job.viewsCount || 0,
    applicantsCount: job.applicantsCount || 0,
    contactPhone: job.contactPhone || '',
    contactWhatsapp: job.contactWhatsapp || '',
    isBlueCollarFriendly: job.isBlueCollarFriendly ?? false,
    createdBy: userId || job.createdBy || '',
    createdAt: job.createdAt || now,
    updatedAt: now,
  };

  const record = sanitizeForFirestore(rawRecord);

  try {
    await setDoc(doc(db, 'jobs', jobId), record, { merge: true });
    console.log('✅ [Firestore Success] Vacancy saved successfully:', jobId);
  } catch (err) {
    console.error('❌ [Firestore Error] saveVacancyToFirestore failed:', err);
    throw err;
  }
  return jobId;
}

/**
 * Update vacancy status (e.g. approve, reject, close, publish)
 */
export async function updateVacancyStatus(jobId: string, status: Vacancy['status'], isApproved?: boolean) {
  const updates: Record<string, any> = { status, updatedAt: new Date().toISOString() };
  if (isApproved !== undefined) updates.isApproved = isApproved;
  const sanitized = sanitizeForFirestore(updates);
  try {
    await updateDoc(doc(db, 'jobs', jobId), sanitized);
    console.log(`✅ [Firestore Success] Vacancy status updated: ${jobId} -> ${status}`);
  } catch (err) {
    console.error('❌ [Firestore Error] updateVacancyStatus failed:', err);
    throw err;
  }
}

/**
 * Increment job view count
 */
export async function incrementJobViews(jobId: string) {
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      viewsCount: increment(1),
    });
  } catch {}
}

/* ========================================================================= */
/* 2. REAL COMPANIES FIRESTORE SERVICE                                       */
/* ========================================================================= */

/**
 * Get all verified companies for public directory
 */
export async function getVerifiedCompanies(): Promise<Company[]> {
  try {
    const q = query(
      collection(db, 'companies'),
      where('verificationStatus', '==', 'verified')
    );
    const snap = await getDocs(q);
    const list: Company[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Company);
    });
    return list;
  } catch (err) {
    console.error('Error fetching verified companies:', err);
    return [];
  }
}

/**
 * Get company by ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const snap = await getDoc(doc(db, 'companies', companyId));
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as Company;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Update company profile or create if not exists
 */
export async function updateCompanyProfile(companyId: string, data: Partial<Company>) {
  await setDoc(doc(db, 'companies', companyId), {
    ...data,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Create new company profile
 */
export async function createCompanyInFirestore(company: Omit<Company, 'id'>, customId?: string): Promise<Company> {
  const id = customId || `comp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const newCompany: Company = {
    ...company,
    id,
    verified: false,
    verificationStatus: 'pending',
    activeJobsCount: company.activeJobsCount ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'companies', id), newCompany);
  return newCompany;
}

/**
 * Get all companies for search / directory / admin
 */
export async function getAllCompaniesFromFirestore(): Promise<Company[]> {
  try {
    const snap = await getDocs(collection(db, 'companies'));
    const list: Company[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Company);
    });
    return list;
  } catch (err) {
    console.error('Error fetching all companies:', err);
    return [];
  }
}

/**
 * Admin: Verify or change company status
 */
export async function setCompanyVerificationStatus(
  companyId: string, 
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
) {
  await updateDoc(doc(db, 'companies', companyId), {
    verificationStatus: status,
    verified: status === 'verified',
    updatedAt: new Date().toISOString(),
  });
}

/* ========================================================================= */
/* 3. REAL CANDIDATE PROFILES & CVs                                          */
/* ========================================================================= */

/**
 * Get candidate profile
 */
export async function getCandidateProfile(userId: string): Promise<CandidateProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'candidateProfiles', userId));
    if (snap.exists()) {
      return snap.data() as CandidateProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching candidate profile:', err);
    return null;
  }
}

/**
 * Save candidate profile
 */
export async function saveCandidateProfile(userId: string, data: Partial<CandidateProfile>) {
  const now = new Date().toISOString();
  const ref = doc(db, 'candidateProfiles', userId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, sanitizeForFirestore({
      ...data,
      updatedAt: now,
    }));
  } else {
    await setDoc(ref, sanitizeForFirestore({
      ...data,
      id: userId,
      userId: userId,
      createdAt: now,
      updatedAt: now,
    }));
  }
}

/* ========================================================================= */
/* 4. REAL APPLICATIONS FIRESTORE SERVICE                                    */
/* ========================================================================= */

/**
 * Check if candidate already applied to this job
 */
export async function hasCandidateApplied(candidateId: string, jobId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'applications'),
      where('candidateId', '==', candidateId),
      where('jobId', '==', jobId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
}

/**
 * Submit real application to a vacancy
 */
export async function submitJobApplication(
  job: Vacancy,
  candidate: User,
  candidateProfile: CandidateProfile | null,
  coverNote?: string
): Promise<Application> {
  const appId = `app-${Date.now()}`;
  const now = new Date().toISOString();

  // Check duplicate
  const alreadyApplied = await hasCandidateApplied(candidate.id, job.id);
  if (alreadyApplied) {
    throw new Error('Siz artıq bu vakansiyaya müraciət etmisiniz.');
  }

  const rawApp: Application = {
    id: appId,
    jobId: job.id,
    vacancyId: job.id,
    vacancyTitle: job.title,
    companyId: job.companyId,
    companyName: job.companyName,
    companyLogo: job.companyLogo || '',
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    candidatePhone: candidate.phone || '',
    candidatePhoto: candidate.avatarUrl || candidateProfile?.profilePhoto || '',
    appliedDate: now.split('T')[0],
    status: 'Müraciət edildi',
    coverNote: coverNote || '',
    cvUrl: candidateProfile?.cvUrl || '',
    cvData: {
      id: `cv-${candidate.id}`,
      title: `${candidate.fullName} - CV`,
      lastUpdated: now,
      personalInfo: {
        fullName: candidate.fullName,
        jobTitle: candidateProfile?.professionalTitle || 'Namizəd',
        email: candidate.email,
        phone: candidate.phone || '',
        address: candidateProfile?.location || 'Bakı',
        summary: candidateProfile?.about || '',
        photoUrl: candidate.avatarUrl,
      },
      experiences: candidateProfile?.workExperience || [],
      education: candidateProfile?.education || [],
      skills: (candidateProfile?.skills || []).map((s, idx) => ({
        id: `s-${idx}`,
        name: s,
        level: 'Yaxşı',
        category: 'Texniki',
      })),
      languages: candidateProfile?.languages || [],
      projects: [],
      certificates: candidateProfile?.certifications || [],
    },
    createdAt: now,
    updatedAt: now,
  };

  const newApp = sanitizeForFirestore(rawApp);
  await setDoc(doc(db, 'applications', appId), newApp);

  // Increment applicants count on job
  await updateDoc(doc(db, 'jobs', job.id), {
    applicantsCount: increment(1),
  }).catch(() => {});

  // Create real notification for employer
  await createNotification({
    userId: job.createdBy || job.companyId,
    title: 'Yeni Namizəd Müraciəti!',
    message: `${candidate.fullName} "${job.title}" vakansiyasına müraciət etdi.`,
    type: 'new_applicant',
    link: `/employer/applications`,
  });

  return newApp;
}

/**
 * Direct save application to Firestore (handles both registered candidates and guest applications with CV file uploads)
 */
export async function saveApplicationDirectToFirestore(app: Application): Promise<void> {
  try {
    // Sanitize document for Firestore: if cvFileData is excessively large base64 (> 600KB), truncate or store safely so Firestore 1MB doc limit is not exceeded
    const firestoreApp = { ...app };
    if (firestoreApp.cvFileData && firestoreApp.cvFileData.length > 700000) {
      firestoreApp.cvFileData = firestoreApp.cvFileData.slice(0, 300000);
    }

    const sanitizedApp = sanitizeForFirestore(firestoreApp);
    await setDoc(doc(db, 'applications', app.id), sanitizedApp);
    if (app.vacancyId || app.jobId) {
      const jId = app.vacancyId || app.jobId!;
      await updateDoc(doc(db, 'jobs', jId), {
        applicantsCount: increment(1),
      }).catch(() => {});
    }

    // Create real notification for employer
    if (app.companyId) {
      await createNotification({
        userId: app.companyId,
        title: '📋 Yeni Müraciət Qəbul Olundu!',
        message: `${app.candidateName} "${app.vacancyTitle}" vakansiyasına müraciət etdi.`,
        type: 'new_applicant',
        link: `/business/applications`,
        data: {
          applicationId: app.id,
          candidateName: app.candidateName,
          vacancyTitle: app.vacancyTitle,
        }
      }).catch(() => {});
    }

    // Create confirmation notification for candidate
    const candidateTargetId = app.candidateId || app.candidateEmail;
    if (candidateTargetId) {
      await createNotification({
        userId: candidateTargetId,
        title: '✅ Müraciətiniz Uğurla Çatdırıldı',
        message: `"${app.vacancyTitle}" vakansiyası üzrə müraciətiniz və CV profiliniz ${app.companyName} şirkətinə göndərildi.`,
        type: 'application_submitted',
        link: `/candidate/applications`,
        data: {
          applicationId: app.id,
          vacancyTitle: app.vacancyTitle,
          companyName: app.companyName,
          candidateEmail: app.candidateEmail,
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Firestore save application error:', err);
  }
}

/**
 * Get candidate's own applications (by candidateId or email)
 */
export async function getCandidateApplications(candidateId?: string, candidateEmail?: string): Promise<Application[]> {
  try {
    const list: Application[] = [];
    const seenIds = new Set<string>();

    if (candidateId) {
      const q = query(
        collection(db, 'applications'),
        where('candidateId', '==', candidateId)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({ ...d.data(), id: d.id } as Application);
        }
      });
    }

    if (candidateEmail) {
      const qEmail = query(
        collection(db, 'applications'),
        where('candidateEmail', '==', candidateEmail.trim().toLowerCase())
      );
      const snapEmail = await getDocs(qEmail);
      snapEmail.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({ ...d.data(), id: d.id } as Application);
        }
      });
    }

    return list;
  } catch (err) {
    console.error('Error fetching candidate applications:', err);
    return [];
  }
}

/**
 * Get employer's company applications
 */
export async function getCompanyApplications(companyId: string, companyName?: string): Promise<Application[]> {
  try {
    const list: Application[] = [];
    const seenIds = new Set<string>();

    if (companyId) {
      const q = query(
        collection(db, 'applications'),
        where('companyId', '==', companyId)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({ ...d.data(), id: d.id } as Application);
        }
      });
    }

    if (companyName) {
      const qName = query(
        collection(db, 'applications'),
        where('companyName', '==', companyName)
      );
      const snapName = await getDocs(qName);
      snapName.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({ ...d.data(), id: d.id } as Application);
        }
      });
    }

    return list;
  } catch (err) {
    console.error('Error fetching company applications:', err);
    return [];
  }
}

/**
 * Get all applications for Admin panel and system sync
 */
export async function getAllApplicationsFromFirestore(): Promise<Application[]> {
  try {
    const snap = await getDocs(collection(db, 'applications'));
    const list: Application[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Application);
    });
    return list;
  } catch (err) {
    console.error('Error fetching all applications:', err);
    return [];
  }
}

/**
 * Update application status (Employer / Admin)
 */
export async function updateApplicationStatus(
  applicationId: string, 
  status: Application['status'], 
  recruiterNotes?: string
) {
  const updates: Record<string, any> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (recruiterNotes !== undefined) updates.recruiterNotes = recruiterNotes;

  try {
    await updateDoc(doc(db, 'applications', applicationId), updates);
  } catch (err) {
    console.warn('Firestore updateApplicationStatus doc note:', err);
  }

  // Notify candidate
  try {
    const snap = await getDoc(doc(db, 'applications', applicationId));
    if (snap.exists()) {
      const appData = snap.data() as Application;
      const targetUserId = appData.candidateId || appData.candidateEmail;
      if (targetUserId) {
        let notifTitle = '📋 Müraciət Statusu Yeniləndi';
        let notifType: AppNotification['type'] = 'status_changed';
        let notifMsg = `"${appData.vacancyTitle}" vakansiyası üzrə müraciətinizin statusu yeniləndi: ${status}`;

        if (status === 'Müsahibəyə dəvət') {
          notifTitle = '🗓️ Müsahibəyə Dəvət Olundunuz!';
          notifType = 'interview_invite';
          notifMsg = `Təbrik edirik! İşəgötürən "${appData.vacancyTitle}" vakansiyası üzrə müraciətinizi bəyəndi və sizi müsahibəyə dəvət edir.`;
        } else if (status === 'Təklif verildi') {
          notifTitle = '🎉 Rəsmi İş Təklifi Göndərildi!';
          notifType = 'job_offer';
          notifMsg = `Əla xəbər! "${appData.vacancyTitle}" vəzifəsi üzrə rəsmi iş təklifiniz hazırdır.`;
        } else if (status === 'Qəbul edildi') {
          notifTitle = '✅ İşə Qəbul Təsdiqləndi!';
          notifType = 'status_changed';
          notifMsg = `Təbrik edirik! "${appData.vacancyTitle}" vakansiyası üzrə işə qəbul prosesiniz uğurla tamamlandı.`;
        } else if (status === 'Baxıldı') {
          notifTitle = '👀 Müraciətinizə Baxıldı';
          notifType = 'status_changed';
          notifMsg = `İşəgötürən "${appData.vacancyTitle}" vakansiyası üzrə CV-nizi nəzərdən keçirdi.`;
        }

        if (recruiterNotes) {
          notifMsg += ` (İşəgötürən qeydi: "${recruiterNotes}")`;
        }

        await createNotification({
          userId: targetUserId,
          title: notifTitle,
          message: notifMsg,
          type: notifType,
          link: '/candidate/applications',
          data: {
            applicationId,
            status,
            vacancyTitle: appData.vacancyTitle,
            companyName: appData.companyName,
            candidateEmail: appData.candidateEmail,
          },
        });
      }
    }
  } catch (notifErr) {
    console.warn('Notification dispatch note:', notifErr);
  }
}

/* ========================================================================= */
/* 5. REAL NOTIFICATIONS FIRESTORE SERVICE                                   */
/* ========================================================================= */

const LOCAL_NOTIFS_KEY = 'jobia_notifications_store';

function getLocalNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(list: AppNotification[]) {
  try {
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Create a real notification (Firestore + Local fallback)
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: AppNotification['type'];
  link?: string;
  data?: Record<string, any>;
}): Promise<string> {
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const notif: AppNotification = {
    id: notifId,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    isRead: false,
    link: data.link,
    data: data.data,
    createdAt: new Date().toISOString(),
  };

  // 1. Save local
  const localList = getLocalNotifications();
  localList.unshift(notif);
  saveLocalNotifications(localList.slice(0, 100));

  // 2. Save Firestore
  try {
    const sanitizedNotif = sanitizeForFirestore(notif);
    await setDoc(doc(db, 'notifications', notifId), sanitizedNotif);
  } catch (err) {
    console.warn('Firestore createNotification notice, saved locally:', err);
  }

  // Trigger browser custom event for immediate in-window reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: notif }));
  }

  return notifId;
}

/**
 * Realtime subscribe to user notifications
 */
export function subscribeToUserNotifications(
  userId: string, 
  callback: (notifications: AppNotification[]) => void
) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  // Initial dispatch from local storage
  const local = getLocalNotifications().filter(
    (n) => n.userId === userId || n.userId === 'all' || (n.data?.candidateEmail && n.data?.candidateEmail === userId)
  );
  callback(local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

  // Listen to window custom events
  const handleLocalEvent = () => {
    const updated = getLocalNotifications().filter(
      (n) => n.userId === userId || n.userId === 'all' || (n.data?.candidateEmail && n.data?.candidateEmail === userId)
    );
    callback(updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };
  window.addEventListener('jobia_new_notification', handleLocalEvent);

  let unsubscribeFirestore = () => {};
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [userId, 'all'])
    );
    unsubscribeFirestore = onSnapshot(q, (snap) => {
      const list: AppNotification[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as AppNotification);
      });
      // Merge with any offline local notifications
      const curLocal = getLocalNotifications().filter((n) => n.userId === userId || n.userId === 'all');
      const mergedMap = new Map<string, AppNotification>();
      curLocal.forEach((n) => mergedMap.set(n.id, n));
      list.forEach((n) => mergedMap.set(n.id, n));

      const mergedList = Array.from(mergedMap.values());
      mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      saveLocalNotifications(mergedList);
      callback(mergedList);
    }, (err) => {
      console.warn('Notification snapshot notice, using local store:', err);
    });
  } catch (e) {
    console.warn('Firestore notification query note:', e);
  }

  return () => {
    window.removeEventListener('jobia_new_notification', handleLocalEvent);
    unsubscribeFirestore();
  };
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notifId: string) {
  // Update local
  const list = getLocalNotifications();
  const idx = list.findIndex((n) => n.id === notifId);
  if (idx >= 0) {
    list[idx].isRead = true;
    saveLocalNotifications(list);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: { id: notifId, isRead: true } }));
  }

  // Update Firestore
  try {
    await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
  } catch (err) {
    console.warn('Firestore markNotificationAsRead notice:', err);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  // Update local
  const list = getLocalNotifications();
  list.forEach((n) => {
    if (n.userId === userId || n.userId === 'all') {
      n.isRead = true;
    }
  });
  saveLocalNotifications(list);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: { allRead: true } }));
  }

  // Update Firestore
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [userId, 'all']),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    const promises = snap.docs.map((d) => updateDoc(doc(db, 'notifications', d.id), { isRead: true }));
    await Promise.all(promises);
  } catch (err) {
    console.warn('Firestore markAllNotificationsAsRead notice:', err);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotificationFromFirestore(notifId: string) {
  // Update local
  const list = getLocalNotifications().filter((n) => n.id !== notifId);
  saveLocalNotifications(list);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: { deletedId: notifId } }));
  }

  // Update Firestore
  try {
    await deleteDoc(doc(db, 'notifications', notifId));
  } catch (err) {
    console.warn('Firestore deleteNotification notice:', err);
  }
}

/**
 * Clear all notifications for a user
 */
export async function clearAllNotificationsForUser(userId: string) {
  // Update local
  const list = getLocalNotifications().filter((n) => n.userId !== userId && n.userId !== 'all');
  saveLocalNotifications(list);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: { cleared: true } }));
  }

  // Update Firestore
  try {
    const q = query(collection(db, 'notifications'), where('userId', 'in', [userId, 'all']));
    const snap = await getDocs(q);
    const promises = snap.docs.map((d) => deleteDoc(doc(db, 'notifications', d.id)));
    await Promise.all(promises);
  } catch (err) {
    console.warn('Firestore clearAllNotifications notice:', err);
  }
}

/* ========================================================================= */
/* 6. REAL JOB OFFERS FIRESTORE SERVICE                                      */
/* ========================================================================= */

/**
 * Create Job Offer
 */
export async function createJobOfferInFirestore(offer: Partial<JobOffer>): Promise<string> {
  const offerId = offer.id || `offer-${Date.now()}`;
  const now = new Date().toISOString();

  const record: JobOffer = {
    id: offerId,
    candidateId: offer.candidateId || '',
    candidateName: offer.candidateName || '',
    candidateEmail: offer.candidateEmail || '',
    candidatePhone: offer.candidatePhone || '',
    companyId: offer.companyId || '',
    companyName: offer.companyName || '',
    companyLogo: offer.companyLogo || '',
    companyAddress: offer.companyAddress || 'Bakı, Azərbaycan',
    companyEmail: offer.companyEmail || '',
    companyPhone: offer.companyPhone || '',
    hrContactPerson: offer.hrContactPerson || '',
    hrContactPosition: offer.hrContactPosition || '',
    position: offer.position || 'Mütəxəssis',
    department: offer.department || 'Əsas',
    employmentType: offer.employmentType || 'Full-time',
    workLocation: offer.workLocation || 'Bakı',
    startDate: offer.startDate || now.split('T')[0],
    grossSalary: offer.grossSalary || 0,
    netSalary: offer.netSalary || 0,
    probationPeriod: offer.probationPeriod || '3 months',
    workingSchedule: offer.workingSchedule || '09:00 - 18:00 (B.e. - Cümə)',
    annualLeave: offer.annualLeave || '21 təqvim günü',
    bonus: offer.bonus || 'İllik KPI əsaslı',
    benefits: offer.benefits || [],
    additionalTerms: offer.additionalTerms || '',
    templateId: offer.templateId || 'default-az',
    language: offer.language || 'az',
    status: offer.status || 'SENT',
    secureToken: offer.secureToken || `token-${Date.now()}`,
    createdBy: offer.createdBy || '',
    createdAt: now,
    updatedAt: now,
  };

  const sanitizedRecord = sanitizeForFirestore(record);
  await setDoc(doc(db, 'jobOffers', offerId), sanitizedRecord);

  // Notify candidate
  const targetUserId = record.candidateId || record.candidateEmail;
  if (targetUserId) {
    await createNotification({
      userId: targetUserId,
      title: '🎉 Rəsmi İş Təklifi Aldınız!',
      message: `${record.companyName} şirkəti sizə "${record.position}" vəzifəsi üzrə rəsmi iş təklifi təqdim etdi (${record.netSalary > 0 ? record.netSalary + ' AZN NET' : 'Şərtlər daxildə'}).`,
      type: 'job_offer',
      link: '/candidate/offers',
      data: {
        offerId,
        companyName: record.companyName,
        position: record.position,
        salary: record.netSalary > 0 ? `${record.netSalary} AZN` : undefined,
      }
    });
  }

  return offerId;
}

/**
 * Candidate responds to Job Offer (Accept / Decline)
 */
export async function respondToJobOffer(
  offerId: string, 
  status: 'ACCEPTED' | 'DECLINED',
  reason?: { category: any; text?: string }
) {
  const now = new Date().toISOString();
  const updates: Record<string, any> = {
    status,
    updatedAt: now,
  };
  if (status === 'ACCEPTED') updates.acceptedAt = now;
  if (status === 'DECLINED') {
    updates.declinedAt = now;
    if (reason) updates.declineReason = reason;
  }

  await updateDoc(doc(db, 'jobOffers', offerId), updates);
}

/**
 * Get company offers
 */
export async function getCompanyOffers(companyId: string): Promise<JobOffer[]> {
  try {
    const q = query(
      collection(db, 'jobOffers'),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    const list: JobOffer[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as JobOffer);
    });
    return list;
  } catch (err) {
    console.error('Error fetching company offers:', err);
    return [];
  }
}

/**
 * Get candidate offers
 */
export async function getCandidateOffers(candidateId: string, email?: string): Promise<JobOffer[]> {
  try {
    const q = query(
      collection(db, 'jobOffers'),
      where('candidateId', '==', candidateId)
    );
    const snap = await getDocs(q);
    const list: JobOffer[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as JobOffer);
    });
    return list;
  } catch (err) {
    console.error('Error fetching candidate offers:', err);
    return [];
  }
}

/* ========================================================================= */
/* 7. REAL SAVED JOBS (BOOKMARKS)                                            */
/* ========================================================================= */

export async function toggleSaveJobInFirestore(userId: string, jobId: string): Promise<boolean> {
  const docId = `${userId}_${jobId}`;
  const ref = doc(db, 'savedJobs', docId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref);
    return false; // removed
  } else {
    await setDoc(ref, {
      id: docId,
      userId,
      jobId,
      savedAt: new Date().toISOString(),
    });
    return true; // saved
  }
}

export async function getSavedJobIds(userId: string): Promise<string[]> {
  try {
    const q = query(
      collection(db, 'savedJobs'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const ids: string[] = [];
    snap.forEach((d) => {
      ids.push(d.data().jobId);
    });
    return ids;
  } catch {
    return [];
  }
}

/* ========================================================================= */
/* 8. REAL SUBSCRIPTIONS & MONETIZATION FIRESTORE SERVICE                   */
/* ========================================================================= */

export interface FirestoreSubscriptionRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: 'candidate' | 'business' | 'admin';
  planId: string;
  tier: 'FREE' | 'PRO' | 'BUSINESS' | 'PREMIUM';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'PENDING';
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentProvider?: string;
  paymentId?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirestorePaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionId?: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  paymentMethod: string;
  cardLast4?: string;
  transactionDate: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
}

export interface FirestoreInvoiceRecord {
  id: string;
  invoiceNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  companyName?: string;
  amount: number;
  currency: string;
  taxAmount?: number;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  status: 'PAID' | 'UNPAID' | 'VOID';
  issuedAt: string;
  paidAt?: string;
  pdfUrl?: string;
}

/**
 * Save or update subscription document in Firestore
 */
export async function saveUserSubscriptionToFirestore(sub: FirestoreSubscriptionRecord): Promise<void> {
  const docRef = doc(db, 'subscriptions', sub.id);
  const sanitized = sanitizeForFirestore({
    ...sub,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(docRef, sanitized, { merge: true });
}

/**
 * Get active subscription for a specific user from Firestore
 */
export async function getUserSubscriptionFromFirestore(userId: string): Promise<FirestoreSubscriptionRecord | null> {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'ACTIVE')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { ...d.data(), id: d.id } as FirestoreSubscriptionRecord;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user subscription from Firestore:', err);
    return null;
  }
}

/**
 * Realtime subscribe to a user's subscription
 */
export function subscribeToUserSubscription(
  userId: string,
  callback: (sub: FirestoreSubscriptionRecord | null) => void
) {
  const q = query(
    collection(db, 'subscriptions'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      // Find active or latest
      const subs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreSubscriptionRecord));
      const active = subs.find((s) => s.status === 'ACTIVE') || subs[0];
      callback(active);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Subscription snapshot error:', err);
    callback(null);
  });
}

/**
 * Get all subscriptions for Admin panel from Firestore
 */
export async function getAllSubscriptionsFromFirestore(): Promise<FirestoreSubscriptionRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'subscriptions'));
    const list: FirestoreSubscriptionRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as FirestoreSubscriptionRecord);
    });
    // Sort by latest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.error('Error fetching all subscriptions:', err);
    return [];
  }
}

/**
 * Update subscription status in Firestore (Admin or User action)
 */
export async function updateSubscriptionStatusInFirestore(
  subId: string,
  status: FirestoreSubscriptionRecord['status']
): Promise<void> {
  await updateDoc(doc(db, 'subscriptions', subId), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Record a payment transaction in Firestore
 */
export async function recordPaymentToFirestore(payment: FirestorePaymentRecord): Promise<string> {
  const payId = payment.id || `pay-${Date.now()}`;
  const now = new Date().toISOString();
  const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const record: FirestorePaymentRecord = {
    ...payment,
    id: payId,
    transactionDate: payment.transactionDate || now,
  };

  const sanitizedPayment = sanitizeForFirestore(record);
  await setDoc(doc(db, 'payments', payId), sanitizedPayment);

  // Auto-generate invoice in Firestore
  const invoiceRecord: FirestoreInvoiceRecord = {
    id: `inv-${payId}`,
    invoiceNumber: invoiceNum,
    userId: payment.userId,
    userEmail: payment.userEmail,
    userName: payment.userName,
    amount: payment.amount,
    currency: payment.currency,
    items: [
      {
        description: payment.planName,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount,
      }
    ],
    status: payment.status === 'SUCCESS' ? 'PAID' : 'UNPAID',
    issuedAt: now,
    paidAt: payment.status === 'SUCCESS' ? now : undefined,
  };

  const sanitizedInvoice = sanitizeForFirestore(invoiceRecord);
  await setDoc(doc(db, 'invoices', `inv-${payId}`), sanitizedInvoice).catch(() => {});

  return payId;
}

/**
 * Get user payment history from Firestore
 */
export async function getUserPaymentsFromFirestore(userId: string): Promise<FirestorePaymentRecord[]> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: FirestorePaymentRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as FirestorePaymentRecord);
    });
    list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    return list;
  } catch (err) {
    console.error('Error fetching user payments:', err);
    return [];
  }
}

/**
 * Get all payments for Admin panel from Firestore
 */
export async function getAllPaymentsFromFirestore(): Promise<FirestorePaymentRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    const list: FirestorePaymentRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as FirestorePaymentRecord);
    });
    list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    return list;
  } catch (err) {
    console.error('Error fetching all payments:', err);
    return [];
  }
}

/* ========================================================================= */
/* 9. REAL USERS & ADMIN LOGS FIRESTORE SERVICE                              */
/* ========================================================================= */

/**
 * Get all users for Admin Panel from Firestore merged with local vault.
 * Guarantees role consistency: business users and employers always retain their business role.
 */
export async function getAllUsersFromFirestore(): Promise<User[]> {
  const usersMap = new Map<string, User>();

  // 1. Preload local users vault
  try {
    const rawLocal = localStorage.getItem('jobia_users_db');
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed)) {
        parsed.forEach((u: any) => {
          if (u && u.email) {
            const emailKey = u.email.trim().toLowerCase();
            const isAdmin = emailKey === 'admin@jobia.az' || emailKey === 'qadiryaqublu@gmail.com' || u.role === 'admin';
            const isBiz = !isAdmin && (u.role === 'business' || Boolean(u.companyName) || Boolean(u.companyId));
            usersMap.set(emailKey, {
              ...u,
              role: isAdmin ? 'admin' : isBiz ? 'business' : 'candidate',
            });
          }
        });
      }
    }
  } catch (e) {}

  // 2. Fetch from Firestore and merge
  try {
    const snap = await getDocs(collection(db, 'users'));
    snap.forEach((d) => {
      const data = d.data() as any;
      const emailKey = (data.email || '').trim().toLowerCase();
      if (emailKey) {
        const existing = usersMap.get(emailKey);
        const isAdmin = emailKey === 'admin@jobia.az' || emailKey === 'qadiryaqublu@gmail.com' || data.role === 'admin' || existing?.role === 'admin';
        const isBiz = !isAdmin && (data.role === 'business' || existing?.role === 'business' || Boolean(data.companyName) || Boolean(data.companyId) || Boolean(existing?.companyName) || Boolean(existing?.companyId));
        const resolvedRole: UserRole = isAdmin ? 'admin' : isBiz ? 'business' : (data.role || existing?.role || 'candidate');

        usersMap.set(emailKey, {
          id: d.id || existing?.id || data.id,
          email: emailKey,
          role: resolvedRole,
          fullName: data.fullName || existing?.fullName || emailKey.split('@')[0],
          firstName: data.firstName || existing?.firstName,
          lastName: data.lastName || existing?.lastName,
          phone: data.phone || existing?.phone,
          companyId: data.companyId || existing?.companyId,
          companyName: data.companyName || existing?.companyName,
          companyDescription: data.companyDescription || existing?.companyDescription,
          avatarUrl: data.avatarUrl || existing?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName || emailKey)}`,
          status: data.status || existing?.status || 'active',
          emailVerified: true,
          createdAt: data.createdAt || existing?.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || existing?.lastLoginAt || new Date().toISOString(),
        });
      }
    });
  } catch (err) {
    console.warn('Firestore fetch all users note, using local users map:', err);
  }

  const list = Array.from(usersMap.values());
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return list;
}

/**
 * Update user account status (e.g. active, suspended) in Firestore
 */
export async function updateUserStatusInFirestore(userId: string, status: 'active' | 'suspended'): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore user status update note:', err);
  }
}

/**
 * Update user account role (e.g. candidate, business, admin) in Firestore and local vault
 */
export async function updateUserRoleInFirestore(userId: string, email: string, role: UserRole): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: new Date().toISOString(),
    }).catch(async () => {
      await setDoc(doc(db, 'users', userId), { role, email, updatedAt: new Date().toISOString() }, { merge: true });
    });
  } catch (err) {
    console.warn('Firestore user role update note:', err);
  }

  try {
    const raw = localStorage.getItem('jobia_users_db');
    if (raw) {
      const users = JSON.parse(raw);
      if (Array.isArray(users)) {
        const idx = users.findIndex((u: any) => u.id === userId || u.email?.toLowerCase() === email.toLowerCase());
        if (idx >= 0) {
          users[idx].role = role;
          localStorage.setItem('jobia_users_db', JSON.stringify(users));
        }
      }
    }
  } catch {}
}

/**
 * Create Admin Log in Firestore
 */
export async function createAdminLogToFirestore(data: {
  action: string;
  adminId: string;
  adminEmail: string;
  targetId?: string;
  targetType?: string;
  details: string;
}): Promise<void> {
  const logId = `admin-log-${Date.now()}`;
  await setDoc(doc(db, 'adminLogs', logId), {
    id: logId,
    ...data,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
}

/* ========================================================================= */
/* 10. ADMIN REALTIME METRICS FROM FIRESTORE                                 */
/* ========================================================================= */

export async function getAdminPlatformMetrics() {
  const [usersSnap, companiesSnap, jobsSnap, appsSnap, offersSnap, paymentsSnap, subsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'companies')),
    getDocs(collection(db, 'jobs')),
    getDocs(collection(db, 'applications')),
    getDocs(collection(db, 'jobOffers')),
    getDocs(collection(db, 'payments')),
    getDocs(collection(db, 'subscriptions')),
  ]);

  let totalHires = 0;
  offersSnap.forEach((d) => {
    if (d.data().status === 'ACCEPTED') totalHires++;
  });

  let totalRevenue = 0;
  paymentsSnap.forEach((d) => {
    const data = d.data();
    if (data.status === 'SUCCESS') {
      totalRevenue += data.amount || 0;
    }
  });

  return {
    totalUsers: usersSnap.size,
    totalCompanies: companiesSnap.size,
    totalVacancies: jobsSnap.size,
    totalApplications: appsSnap.size,
    totalHires: totalHires,
    totalRevenue: Math.round(totalRevenue),
    totalSubscriptions: subsSnap.size,
  };
}
