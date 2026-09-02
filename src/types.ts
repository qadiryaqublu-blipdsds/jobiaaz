export type UserRole = 'candidate' | 'business' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyId?: string;
  companyName?: string;
  companyDescription?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  emailVerified?: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: string;
  verificationAttempts?: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

// -------------------------------------------------------------
// CANDIDATE PROFILE (STORED IN FIRESTORE candidateProfiles/{uid})
// -------------------------------------------------------------
export interface CandidateProfile {
  id: string; // matches auth user id
  userId: string;
  fullName: string;
  professionalTitle: string;
  profilePhoto?: string;
  about: string;
  phone: string;
  email: string;
  location: string;
  skills: string[];
  languages: LanguageItem[];
  education: EducationItem[];
  workExperience: ExperienceItem[];
  certifications: CertificateItem[];
  expectedSalary?: number;
  preferredEmploymentType?: string;
  preferredLocation?: string;
  cvUrl?: string;
  cvFileName?: string;
  profileVisibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// NOTIFICATION TYPE (STORED IN FIRESTORE notifications/{id})
// -------------------------------------------------------------
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 
    | 'application_submitted' 
    | 'status_changed' 
    | 'interview_invite' 
    | 'job_offer' 
    | 'company_verification' 
    | 'vacancy_approval' 
    | 'new_applicant'
    | 'general';
  isRead: boolean;
  link?: string;
  data?: Record<string, any>;
  createdAt: string;
}

// -------------------------------------------------------------
// SUBSCRIPTION & MONETIZATION TYPES
// -------------------------------------------------------------

export type EmployerPlanTier = 'FREE' | 'PRO' | 'BUSINESS';
export type CandidatePlanTier = 'FREE' | 'PREMIUM';
export type PlanTier = EmployerPlanTier | CandidatePlanTier;

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanFeatureLimit {
  maxActiveJobs: number;
  canUseAICandidateMatching: boolean;
  canUseAIInterviewSummary: boolean;
  canGenerateJobOffers: boolean;
  canSearchCandidateDatabase: boolean;
  canExportCandidateData: boolean;
  hasPriorityListing: boolean;
  hasTeamMembers: boolean;
  
  // Candidate limits
  canUseAIATSAnalysis: boolean;
  canUseAIInterviewPrep: boolean;
  hasAllCVTemplates: boolean;
  hasPriorityApplicationBadge: boolean;
  canUseSalaryTrendsIntelligence: boolean;
}

export interface SubscriptionPlan {
  id: string;
  role: 'candidate' | 'business';
  tier: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number; // in AZN
  priceYearly: number; // in AZN per month when billed annually
  features: string[];
  limits: PlanFeatureLimit;
  badge?: string;
  isPopular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  planId: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  amount: number;
  currency: 'AZN';
  paymentProvider: 'MOCK_PAYMENT' | 'STRIPE' | 'AZERI_GATEWAY';
  paymentId: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  currency: 'AZN';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentMethod: string;
  cardLast4?: string;
  transactionDate: string;
  failureReason?: string;
}

export type EmploymentType = 'Tam ştat' | 'Yarım ştat' | 'Hibrid' | 'Uzaqdan (Remote)' | 'Təcrübə proqramı';

export type ExperienceLevel = 'Təcrübəsiz / Junior' | 'Orta (Mid-level, 1-3 il)' | 'Baş (Senior, 3-5+ il)' | 'Rəhbər / Lead';

export type ApplicationStatus = 'Müraciət edildi' | 'Baxıldı' | 'Müsahibəyə dəvət' | 'Təklif verildi' | 'Qəbul edildi' | 'İmtina edildi';

export interface Company {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'suspended';
  industry: string;
  location: string;
  address?: string;
  website?: string;
  email: string;
  phone?: string;
  hrContactName?: string;
  hrContactPosition?: string;
  description: string;
  employeeCount: string;
  activeJobsCount: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  requireOfferApproval?: boolean;
}

export type VacancyStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'paused' | 'closed';

export interface Vacancy {
  id: string;
  title: string;
  department?: string;
  category: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyVerified: boolean;
  city: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  metroStation?: string;
  workplaceType?: 'remote' | 'hybrid' | 'on-site';
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  education?: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  hideSalary?: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  postedDate: string;
  deadline: string;
  status?: VacancyStatus;
  isFeatured?: boolean;
  isApproved?: boolean; // For admin moderation
  editCount?: number; // Tracks number of edits (employer has 1-time edit limit)
  maxEditsAllowed?: number; // Default: 1 edit permitted for employers
  lastEditedAt?: string;
  rejectionReason?: string;
  viewsCount: number;
  applicantsCount: number;
  contactPhone?: string;
  contactWhatsapp?: string;
  isBlueCollarFriendly?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: 'Başlanğıc' | 'Orta' | 'Yaxşı' | 'Əla / Ekspert';
  category: 'Texniki' | 'Soft skill' | 'Alət / Proqram';
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'A1-A2 (Başlanğıc)' | 'B1-B2 (Orta/İşgüzar)' | 'C1-C2 (Sərbəst)' | 'Ana dili';
}

export interface ProjectItem {
  id: string;
  title: string;
  link?: string;
  description: string;
  technologies: string[];
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface CVData {
  id: string;
  title: string;
  lastUpdated: string;
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary: string;
    photoUrl?: string;
  };
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
}

export type CVTemplateType = 'modern-emerald' | 'classic-corporate' | 'minimal-indigo' | 'slate-tech';

export interface Application {
  id: string;
  jobId?: string;
  vacancyId: string;
  vacancyTitle: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidatePhoto?: string;
  appliedDate: string;
  status: ApplicationStatus;
  cvData: CVData;
  cvUrl?: string;
  cvFileName?: string;
  cvFileType?: string;
  cvFileData?: string;
  isGuestApplication?: boolean;
  coverNote?: string;
  matchScore?: number;
  matchHighlights?: string[];
  recruiterNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// INTERVIEW & JOB OFFER WORKFLOW TYPES
// -------------------------------------------------------------

export type HiringDecision = 'Reject' | 'Hold' | 'Second Interview' | 'Hire';

export type OfferEmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type ProbationPeriod = 'None' | '1 month' | '2 months' | '3 months';

export type OfferStatus = 
  | 'DRAFT'
  | 'GENERATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'SEND_FAILED'
  | 'EXPIRED';

export type AuditActionType =
  | 'INTERVIEW_COMPLETED'
  | 'HIRING_DECISION_MADE'
  | 'OFFER_CREATED'
  | 'OFFER_GENERATED'
  | 'OFFER_EDITED'
  | 'OFFER_APPROVED'
  | 'OFFER_SENT'
  | 'OFFER_VIEWED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_DECLINED'
  | 'OFFER_RESENT';

export interface InterviewEvaluation {
  technicalSkills: number;
  relevantExperience: number;
  communication: number;
  problemSolving: number;
  teamwork: number;
  leadership: number;
  culturalFit: number;
  motivation: number;
  overallScore: number;
  strengths: string;
  weaknesses: string;
  interviewNotes: string;
  redFlags?: string;
  overallRecommendation: string;
  aiSummary?: string;
}

export interface InterviewRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  position: string;
  department: string;
  interviewer: string;
  interviewDate: string;
  evaluation: InterviewEvaluation;
  decision: HiringDecision;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferDetails {
  position: string;
  department: string;
  employmentType: OfferEmploymentType;
  workLocation: string;
  startDate: string;
  grossSalary: number;
  netSalary: number;
  probationPeriod: ProbationPeriod;
  workingSchedule: string;
  annualLeave: string;
  bonus: string;
  benefits: string[];
  additionalTerms: string;
}

export interface JobOffer {
  id: string;
  applicationId?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  hrContactPerson: string;
  hrContactPosition: string;
  
  // Offer core terms
  position: string;
  department: string;
  employmentType: OfferEmploymentType;
  workLocation: string;
  startDate: string;
  grossSalary: number;
  netSalary: number;
  probationPeriod: ProbationPeriod;
  workingSchedule: string;
  annualLeave: string;
  bonus: string;
  benefits: string[];
  additionalTerms: string;
  
  // AI Generation & Document
  templateId: string;
  templateName?: string;
  language: 'az' | 'en';
  generatedContent?: string;
  customNotes?: string;
  
  // Status & Security
  status: OfferStatus;
  secureToken: string;
  pdfDataUrl?: string;
  
  // Workflow timestamps & actors
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: {
    category: 'Salary' | 'Position' | 'Start Date' | 'Another Offer' | 'Personal Reasons' | 'Other';
    text?: string;
  };
  lastSendError?: string;
}

export interface JobOfferTemplate {
  id: string;
  name: string;
  description: string;
  language: 'az' | 'en';
  content: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferAuditLog {
  id: string;
  offerId: string;
  candidateName: string;
  action: AuditActionType;
  user: string;
  timestamp: string;
  details: string;
  prevValue?: string;
  newValue?: string;
}

export interface CVAnalysisResult {
  overallScore: number;
  atsScore: number;
  candidateSummary?: string; // 📋 Namizədin Ümumi Xülasəsi (Kimdir, faktiki təcrübəsi)
  strengths: string[]; // ✅ Güclü Tərəfləri
  weaknesses: string[]; // ⚠️ Riskli və ya Çatışmayan Məqamlar
  matchAssessment?: {
    matchPercentage: number;
    rationale: string;
    educationMatch?: string; // Təhsil və İxtisas uyğunluğu
    experienceMatch?: string; // İş təcrübəsinin müddəti və rolu
    skillsMatch?: string; // Texniki və peşəkar bacarıqlar (Hard skills)
    languagesMatch?: string; // Dil bilikləri və əlavə üstünlüklər
  };
  hrRecommendation?: {
    decision: string; // Müsahibəyə Dəvət Tövsiyə Olunur / Nəzərdən Keçirilsin / İmtina
    advice: string; // 💡 HR Tövsiyəsi
  };
  missingKeywords: string[];
  actionableFeedback: {
    section: string;
    issue: string;
    recommendation: string;
    priority: 'Yüksək' | 'Orta' | 'Məsləhət';
  }[];
  marketCompetitiveness: string;
  suggestedJobTitles: string[];
  summaryFeedback: string;
}

export interface InterviewQuestion {
  category: 'Texniki' | 'Davranış və Situasiya' | 'Şirkət Uyğunluğu';
  question: string;
  whyAsked: string;
  suggestedAnswerTip: string;
  sampleAnswerAz: string;
}

export interface SalaryHistoricalPoint {
  period: string;
  minSalary: number;
  avgSalary: number;
  maxSalary: number;
  openingsCount: number;
}

export interface ExperienceSalaryBreakdown {
  level: string;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  sampleSize: number;
}

export interface RoleSalaryStats {
  roleId: string;
  roleName: string;
  category: string;
  currentAvgSalary: number;
  currentMinSalary: number;
  currentMaxSalary: number;
  yearlyGrowthPct: number;
  demandLevel: 'Çox Yüksək' | 'Yüksək' | 'Orta' | 'Stabil';
  experienceBreakdown: ExperienceSalaryBreakdown[];
  trendHistory: SalaryHistoricalPoint[];
  topSkillsValue: { skill: string; salaryBoost: string }[];
  cityComparison: { city: string; avgSalary: number }[];
  description: string;
}

// -------------------------------------------------------------
// RECRUITING ANALYTICS & EVENT-DRIVEN METRICS ENGINE TYPES
// -------------------------------------------------------------

export type RecruitmentEventType =
  | 'VACANCY_CREATED'
  | 'VACANCY_PUBLISHED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_REVIEWED'
  | 'CANDIDATE_QUALIFIED'
  | 'CANDIDATE_SHORTLISTED'
  | 'INTERVIEW_INVITED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'FEEDBACK_SUBMITTED'
  | 'OFFER_CREATED'
  | 'OFFER_SENT'
  | 'OFFER_VIEWED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'CANDIDATE_WITHDRAWN'
  | 'CANDIDATE_HIRED'
  | 'VACANCY_FILLED'
  | 'VACANCY_CLOSED';

export interface RecruitmentEvent {
  id: string;
  vacancyId: string;
  candidateId?: string;
  candidateName?: string;
  employerId?: string;
  companyId: string;
  eventType: RecruitmentEventType;
  timestamp: string; // ISO 8601 string
  metadata?: Record<string, any>;
}

export type ApplicationSource =
  | 'Jobia organic'
  | 'Direct'
  | 'Referral'
  | 'Social Media'
  | 'LinkedIn'
  | 'External source'
  | 'Employer shared link'
  | 'Other';

export type BenchmarkConfidence = 'Məhdud Data' | 'Orta Etibarlılıq' | 'Yüksək Etibarlı Benchmark';
export type BenchmarkStatus = 'Above Market' | 'Around Market Average' | 'Below Market';

export interface MarketBenchmarkData {
  sector: string;
  jobFunction: string;
  seniority: string;
  location: string;
  sampleSize: number;
  confidence: BenchmarkConfidence;
  
  // Percentiles for Time to Fill (days)
  timeToFillP25: number;
  timeToFillMedian: number;
  timeToFillP75: number;
  
  // Percentiles for Time to Hire (days)
  timeToHireP25: number;
  timeToHireMedian: number;
  timeToHireP75: number;

  // Other market medians
  timeToOfferMedian: number;
  timeToScreenMedianHours: number;
  timeToInterviewMedian: number;
  offerAcceptanceRateMedian: number; // e.g. 74%
  qualifiedRateMedian: number; // e.g. 28%
  employerResponseTimeMedianHours: number; // e.g. 24h
  avgCostPerHireAZN: number;
}

export interface FunnelStageMetrics {
  stageKey: string;
  stageName: string;
  stageNameEn: string;
  count: number;
  conversionRateTotalPct: number; // % of total applications
  stepConversionPct: number; // % transition from previous stage
  dropOffCount: number;
  dropOffPct: number;
}

export interface SourceOfHireMetrics {
  source: ApplicationSource;
  applications: number;
  qualified: number;
  interviews: number;
  offers: number;
  hires: number;
  qualifiedRatePct: number;
  hireConversionRatePct: number;
}

export interface VacancyTimelineMilestone {
  id: string;
  eventKey: string;
  title: string;
  date: string;
  elapsedFromPrevious: string;
  elapsedDays: number;
  actor: string;
  details: string;
  iconType: 'publish' | 'app' | 'review' | 'interview' | 'offer' | 'accept' | 'hire' | 'fill';
}

export interface AIRecruitingInsight {
  id: string;
  type: 'success' | 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  metricReference?: string;
  impactScore?: number;
  suggestedAction?: string;
}

export interface RecruitmentCostInput {
  jobAdvertising: number;
  agencyFee: number;
  referralBonus: number;
  recruitmentSoftware: number;
  paidPromotion: number;
  otherExpenses: number;
}

export interface VacancyRecruitingMetrics {
  vacancyId: string;
  vacancyTitle: string;
  department: string;
  category: string;
  jobFunction: string;
  seniority: string;
  location: string;
  companyId: string;
  status: VacancyStatus;
  
  // Dates
  createdAt: string;
  publishedAt: string;
  closedAt?: string;
  filledAt?: string;
  
  // Time Metrics
  isOpen: boolean;
  openDurationDays: number;
  timeToFillDays: number | null;
  timeToFillFormatted: string;
  timeToFirstApplicationDays: number | null;
  timeToFirstQualifiedDays: number | null;
  
  // Hire metrics
  hiredCount: number;
  avgTimeToHireDays: number | null;
  medianTimeToHireDays: number | null;
  fastestHireDays: number | null;
  longestHireDays: number | null;
  
  // Offer metrics
  offersSentCount: number;
  offersAcceptedCount: number;
  offersDeclinedCount: number;
  offerAcceptanceRatePct: number;
  avgTimeToOfferDays: number | null;
  medianTimeToOfferDays: number | null;
  avgTimeToAcceptDays: number | null;
  
  // Screening & Interview
  timeToScreenHours: number | null;
  screeningSLACompliancePct: number;
  timeToInterviewDays: number | null;
  
  // Counts & Funnel
  totalApplications: number;
  reviewedApplications: number;
  qualifiedApplications: number;
  qualifiedRatePct: number;
  shortlistedCount: number;
  interviewInvitedCount: number;
  interviewedCount: number;
  finalCandidatesCount: number;
  funnelStages: FunnelStageMetrics[];
  
  // Quality & CV
  avgCandidateMatchScore: number;
  topCandidateScore: number;
  candidatesAbove80ScorePct: number;
  candidatesAbove90ScorePct: number;
  
  // Cost
  totalCostAZN: number;
  costPerHireAZN: number | null;
  
  // Benchmark
  benchmark: MarketBenchmarkData;
  marketComparison: {
    timeToFillDiffPct: number; // e.g. -33% (33% faster)
    timeToFillStatus: BenchmarkStatus;
    percentileRank: number; // e.g. 75
    comparisonSummary: string;
  };
  
  // Effectiveness Score
  recruitingEffectivenessScore: number; // 0-100
  effectivenessRating: 'Mükəmməl' | 'Yüksək' | 'Orta' | 'Təkmilləşdirmə Tələb Olunur';
  
  // Timeline
  milestones: VacancyTimelineMilestone[];
  
  // AI Insights
  insights: AIRecruitingInsight[];
}
