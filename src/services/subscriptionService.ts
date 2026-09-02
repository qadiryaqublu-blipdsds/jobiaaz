import {
  SubscriptionPlan,
  UserSubscription,
  PaymentTransaction,
  UserRole,
  PlanTier,
  BillingCycle,
} from '../types';
import { 
  saveUserSubscriptionToFirestore, 
  recordPaymentToFirestore, 
  updateSubscriptionStatusInFirestore 
} from './firestoreService';

const SUBSCRIPTION_STORAGE_KEY = 'jobia_subscriptions_db';
const TRANSACTIONS_STORAGE_KEY = 'jobia_transactions_db';

// Master Plans Catalog
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // -------------------------------------------------------------
  // EMPLOYER / BUSINESS PLANS
  // -------------------------------------------------------------
  {
    id: 'plan-employer-free',
    role: 'business',
    tier: 'FREE',
    name: 'Free (Başlanğıc)',
    tagline: 'Kiçik şirkətlər və ilk dəfə işçi axtaranlar üçün baza paketi.',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '1 aktiv vakansiya elanı',
      'Standart namizəd müraciətlərini qəbul etmə',
      'Əsas namizəd CV baxışı',
      'Namizəd müraciət statuslarını dəyişmə',
      'Standart e-poçt dəstəyi',
    ],
    limits: {
      maxActiveJobs: 1,
      canUseAICandidateMatching: false,
      canUseAIInterviewSummary: false,
      canGenerateJobOffers: false,
      canSearchCandidateDatabase: false,
      canExportCandidateData: false,
      hasPriorityListing: false,
      hasTeamMembers: false,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: false,
    },
  },
  {
    id: 'plan-employer-pro',
    role: 'business',
    tier: 'PRO',
    name: 'Pro Recruiter',
    tagline: 'Aktiv işçi axtaran və işə qəbul prosesini sürətləndirən şirkətlər üçün.',
    priceMonthly: 49,
    priceYearly: 39,
    badge: 'Ən Populyar',
    isPopular: true,
    features: [
      '5 aktiv vakansiya elanı',
      'AI Namizəd Uyğunluq Skoru və Açar söz təhlili',
      'Shortlist və Namizəd qeydləri',
      'AI Müsahibə Dəyərləndirməsi & Avtomat Xülasə',
      'AI ilə Rəsmi İş Təklifi (Job Offer) və 1-kliklə göndəriş',
      'Rəsmi A4 PDF Təklif sənədi və Namizəd Portalı',
      'Prioritet HR Texniki Dəstəyi',
    ],
    limits: {
      maxActiveJobs: 5,
      canUseAICandidateMatching: true,
      canUseAIInterviewSummary: true,
      canGenerateJobOffers: true,
      canSearchCandidateDatabase: false,
      canExportCandidateData: true,
      hasPriorityListing: true,
      hasTeamMembers: false,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: false,
    },
  },
  {
    id: 'plan-employer-business',
    role: 'business',
    tier: 'BUSINESS',
    name: 'Enterprise / Business',
    tagline: 'Böyük holdinqlər, korporasiyalar və limitsiz işə qəbul komandaları üçün.',
    priceMonthly: 129,
    priceYearly: 99,
    badge: 'Limitsiz İmkanlar',
    features: [
      'Limitsiz aktiv vakansiya elanları',
      'Tam Namizəd və CV Bazası axtarışı (Bütün namizədlər)',
      'Toplu (Bulk) namizəd idarəetməsi və Excel/PDF ixracı',
      'Bütün AI Funksiyaları (Matching, Interview AI, Smart Offer)',
      'Vakansiyaların axtarışda ƏN ÖNDƏ görünməsi (Featured)',
      'Komanda HR menecerləri və rol bölüşdürülməsi',
      '7/24 Şəxsi HR Menecer & VIP Dəstək',
    ],
    limits: {
      maxActiveJobs: 9999,
      canUseAICandidateMatching: true,
      canUseAIInterviewSummary: true,
      canGenerateJobOffers: true,
      canSearchCandidateDatabase: true,
      canExportCandidateData: true,
      hasPriorityListing: true,
      hasTeamMembers: true,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: false,
    },
  },

  // -------------------------------------------------------------
  // CANDIDATE PLANS
  // -------------------------------------------------------------
  {
    id: 'plan-candidate-free',
    role: 'candidate',
    tier: 'FREE',
    name: 'Standart Namizəd',
    tagline: 'Karyerasına yeni başlayan və iş axtaran namizədlər üçün pulsuz paket.',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Peşəkar Onlayn CV Profili',
      'CV Generator (Klassik Zümrüd şablonu)',
      'Bütün vakansiyalara 1 kliklə müraciət',
      'CV-ni PDF kimi birbaşa yükləmə',
      'Müraciət statusları və bildirişlər',
      'İş Təkliflərini Onlayn Portaldan cavablama',
    ],
    limits: {
      maxActiveJobs: 0,
      canUseAICandidateMatching: false,
      canUseAIInterviewSummary: false,
      canGenerateJobOffers: false,
      canSearchCandidateDatabase: false,
      canExportCandidateData: false,
      hasPriorityListing: false,
      hasTeamMembers: false,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: true,
    },
  },
  {
    id: 'plan-candidate-premium',
    role: 'candidate',
    tier: 'PREMIUM',
    name: 'Candidate Premium AI',
    tagline: 'Müsahibələrdən 3 qat daha tez keçmək və arzuladığı işi tapmaq istəyənlər üçün.',
    priceMonthly: 9,
    priceYearly: 6.9,
    badge: 'Karyera Sürətləndirici',
    isPopular: true,
    features: [
      '4 Müasir Dizaynda Premium CV Şablonu (Modern, Corporate, Minimal, Tech)',
      'AI ATS CV Analizi, Uyğunluq Skoru və Təkmilləşdirmə Məsləhətləri',
      'AI Müsahibə Simulyatoru və Vakansiyaya Özəl Sual-Cavablar',
      'İşəgötürənin müraciət siyahısında "Premium Namizəd" nişanı',
      'Dərinləşdirilmiş Maaş Trendləri və Şirkət İnsights',
      'Sürətli PDF İxracı və limitsiz versiyalama',
    ],
    limits: {
      maxActiveJobs: 0,
      canUseAICandidateMatching: false,
      canUseAIInterviewSummary: false,
      canGenerateJobOffers: false,
      canSearchCandidateDatabase: false,
      canExportCandidateData: false,
      hasPriorityListing: false,
      hasTeamMembers: false,
      canUseAIATSAnalysis: true,
      canUseAIInterviewPrep: true,
      hasAllCVTemplates: true,
      hasPriorityApplicationBadge: true,
      canUseSalaryTrendsIntelligence: true,
    },
  },
];

export function getStoredSubscriptions(): UserSubscription[] {
  const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredSubscriptions(subs: UserSubscription[]): void {
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subs));
}

export function getStoredTransactions(): PaymentTransaction[] {
  const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredTransactions(txs: PaymentTransaction[]): void {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txs));
}

// Get plans filtered by user role
export function getPlansByRole(role: UserRole): SubscriptionPlan[] {
  if (role === 'admin') {
    return SUBSCRIPTION_PLANS;
  }
  return SUBSCRIPTION_PLANS.filter((p) => p.role === (role === 'business' ? 'business' : 'candidate'));
}

// Get active subscription for a specific user
export function getUserActiveSubscription(userId?: string, role: UserRole = 'candidate', userEmail?: string): UserSubscription {
  const subs = getStoredSubscriptions();
  
  // Find subscription by userId or userEmail
  const match = subs.find(
    (s) => (userId && s.userId === userId) || (userEmail && s.userEmail.toLowerCase() === userEmail.toLowerCase())
  );

  if (match && match.status === 'ACTIVE') {
    return match;
  }

  // Fallback: Default Free Subscription
  const defaultPlanId = role === 'business' ? 'plan-employer-free' : 'plan-candidate-free';
  return {
    id: `sub-default-${userId || 'guest'}`,
    userId: userId || 'guest',
    userEmail: userEmail || 'user@jobia.az',
    userName: 'İstifadəçi',
    role,
    planId: defaultPlanId,
    tier: 'FREE',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 0,
    currency: 'AZN',
    paymentProvider: 'AZERI_GATEWAY',
    paymentId: 'none',
    autoRenew: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const getUserSubscription = getUserActiveSubscription;

// Helper: Check feature permission based on user plan / tier
export function checkFeatureAccess(
  subOrRole: UserSubscription | UserRole,
  featureOrTier: keyof SubscriptionPlan['limits'] | string,
  countOrFeature?: number | keyof SubscriptionPlan['limits'],
  extraCount?: number
): { allowed: boolean; requiredPlan: string; limit?: number; message?: string } {
  let planTier: string = 'FREE';
  let feature: keyof SubscriptionPlan['limits'];
  let currentCount: number | undefined;

  if (typeof subOrRole === 'object' && subOrRole !== null) {
    planTier = subOrRole.tier;
    feature = featureOrTier as keyof SubscriptionPlan['limits'];
    currentCount = typeof countOrFeature === 'number' ? countOrFeature : undefined;
  } else {
    planTier = (typeof featureOrTier === 'string' ? featureOrTier : 'FREE');
    feature = countOrFeature as keyof SubscriptionPlan['limits'];
    currentCount = extraCount;
  }

  const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === planTier) || SUBSCRIPTION_PLANS[0];
  
  if (feature === 'maxActiveJobs') {
    const limit = plan.limits.maxActiveJobs;
    if (currentCount !== undefined && currentCount >= limit) {
      return {
        allowed: false,
        requiredPlan: limit === 1 ? 'PRO' : 'BUSINESS',
        limit,
        message: `Cari planınızda maksimum ${limit} aktiv vakansiya yerləşdirə bilərsiniz. Limitsiz vakansiya üçün planınızı yüksəldin.`,
      };
    }
    return { allowed: true, requiredPlan: plan.tier, limit };
  }

  if ((feature as string) === 'post_jobs') {
    const limit = plan.limits.maxActiveJobs;
    if (currentCount !== undefined && currentCount >= limit) {
      return {
        allowed: false,
        requiredPlan: 'PRO',
        limit,
        message: `Cari pulsuz planınızda maksimum ${limit} aktiv vakansiya yerləşdirə bilərsiniz.`,
      };
    }
    return { allowed: true, requiredPlan: plan.tier, limit };
  }

  const isAllowed = Boolean(plan.limits[feature]);
  if (!isAllowed) {
    let requiredPlan = 'PRO';
    if (feature === 'canSearchCandidateDatabase' || feature === 'hasTeamMembers') {
      requiredPlan = 'BUSINESS';
    } else if (feature === 'canUseAIATSAnalysis' || feature === 'canUseAIInterviewPrep' || feature === 'hasAllCVTemplates') {
      requiredPlan = 'PREMIUM';
    }

    return {
      allowed: false,
      requiredPlan,
      message: `Bu funksiya ${requiredPlan} planına daxildir. Zəhmət olmasa planınızı yüksəldin.`,
    };
  }

  return { allowed: true, requiredPlan: plan.tier };
}

// Activate / Upgrade subscription with payment transaction
export function applySubscriptionUpgrade(data: {
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  planId: string;
  billingCycle: BillingCycle;
  cardLast4?: string;
  paymentMethod?: string;
}): { subscription: UserSubscription; transaction: PaymentTransaction } {
  const targetPlan = SUBSCRIPTION_PLANS.find((p) => p.id === data.planId);
  if (!targetPlan) {
    throw new Error('Seçilmiş plan tapılmadı.');
  }

  const subs = getStoredSubscriptions();
  const txs = getStoredTransactions();

  const now = new Date();
  const durationMonths = data.billingCycle === 'yearly' ? 12 : 1;
  const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

  const amount = data.billingCycle === 'yearly' ? targetPlan.priceYearly * 12 : targetPlan.priceMonthly;

  const txId = `tx-${Date.now()}`;
  const subId = `sub-${Date.now()}`;

  const newSub: UserSubscription = {
    id: subId,
    userId: data.userId,
    userEmail: data.userEmail,
    userName: data.userName,
    role: data.role,
    planId: targetPlan.id,
    tier: targetPlan.tier,
    status: 'ACTIVE',
    billingCycle: data.billingCycle,
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    amount,
    currency: 'AZN',
    paymentProvider: 'AZERI_GATEWAY',
    paymentId: txId,
    autoRenew: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const newTx: PaymentTransaction = {
    id: txId,
    userId: data.userId,
    userEmail: data.userEmail,
    userName: data.userName,
    subscriptionId: subId,
    planName: `${targetPlan.name} (${data.billingCycle === 'yearly' ? 'İllik' : 'Aylıq'})`,
    amount,
    currency: 'AZN',
    status: 'SUCCESS',
    paymentMethod: data.paymentMethod || 'Bank Kartı (Onlayn Ödəniş)',
    cardLast4: data.cardLast4 || '4242',
    transactionDate: now.toISOString(),
  };

  const existingIdx = subs.findIndex(
    (s) => s.userId === data.userId || (data.userEmail && s.userEmail.toLowerCase() === data.userEmail.toLowerCase())
  );
  if (existingIdx >= 0) {
    subs[existingIdx] = newSub;
  } else {
    subs.unshift(newSub);
  }

  txs.unshift(newTx);

  saveStoredSubscriptions(subs);
  saveStoredTransactions(txs);

  saveUserSubscriptionToFirestore(newSub).catch((err) => {
    console.warn('Firestore subscription sync warning:', err);
  });

  recordPaymentToFirestore(newTx).catch((err) => {
    console.warn('Firestore payment record sync warning:', err);
  });

  return { subscription: newSub, transaction: newTx };
}

// Cancel subscription
export function cancelUserSubscription(subId: string): UserSubscription {
  const subs = getStoredSubscriptions();
  const match = subs.find((s) => s.id === subId);
  if (!match) throw new Error('Abunəlik tapılmadı');

  match.status = 'CANCELLED';
  match.autoRenew = false;
  match.updatedAt = new Date().toISOString();

  saveStoredSubscriptions(subs);

  updateSubscriptionStatusInFirestore(subId, 'CANCELLED').catch((err) => {
    console.warn('Firestore cancel sync warning:', err);
  });

  return match;
}
