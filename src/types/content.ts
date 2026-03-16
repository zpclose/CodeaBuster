import type { Timestamp, FieldValue } from 'firebase/firestore';

// ============================================
// TEAM MEMBERS (Pengurus)
// ============================================

export type TeamMemberTier = string;

export interface TeamMember {
    id: string;
    name: string;
    role: string; // "Ketua Umum", "Wakil Ketua", "Kepala Divisi Proyek", dll
    university: string; // "Telkom University" | "Universitas Mercu Buana"
    quote?: string;
    bio?: string;
    imageUrl: string;
    imageId?: string; // Reference to image-library
    socials: {
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
    tier: TeamMemberTier; // For display grouping
    order: number; // Display order
    isActive: boolean;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

// ============================================
// ACHIEVEMENTS (Pencapaian)
// ============================================

export type AchievementCategory = 'Kompetisi' | 'Proyek Industri' | 'Karya Individu';
export type PortfolioTemplate = 'competition' | 'product' | 'research' | 'event' | 'esports';

export interface PortfolioTeamMember {
    name: string;
    role: string;
    avatarUrl?: string;
    specialization?: string;
    description?: string;
    operationalImpact?: string;
}

export interface PortfolioHighlight {
    label: string;
    value: string;
}

export interface PortfolioLink {
    label: string;
    url: string;
}

export interface PortfolioStrategicPhase {
    title: string;
    focus: string;
    protocol: string;
    metrics: string;
}

export interface PortfolioReadinessAudit {
    id: string;
    title: string;
    detail: string;
}

export interface PortfolioContent {
    tagline?: string;
    problemStatement?: string;
    solutionSummary?: string;
    heroImageUrl?: string;
    certificateImageUrl?: string;
    galleryImages?: string[];
    teamMembers?: PortfolioTeamMember[];
    highlights?: PortfolioHighlight[];
    externalLinks?: PortfolioLink[];
    videoEmbedUrl?: string;
    curatorQuote?: string;
    curatorName?: string;
    curatorTitle?: string;
    strategicPhases?: PortfolioStrategicPhase[];
    readinessAudit?: PortfolioReadinessAudit[];
    closingQuote?: string;
    performanceAuditDescription?: string;
    closingNarrative?: string;
}

export interface Achievement {
    id: string;
    title: string;
    category: AchievementCategory;
    type: string; // UI/UX Challenge, Hackathon, Riset, E-Sports, dll
    description: string;
    year: number;
    team: string;
    institution: string; // "Telkom University", "Codebusters Mercu Buana", dll
    award: string; // "JUARA 1", "Best Paper", dll
    thumbnailUrl: string;
    thumbnailId?: string;
    isHallOfFame: boolean;

    // Hall of Fame specific fields
    curatorQuote?: string;
    curatorName?: string;
    curatorTitle?: string;
    curatorImageUrl?: string;
    curatorImageId?: string;

    // Portfolio page fields
    portfolioTemplate?: PortfolioTemplate | null;
    portfolioSlug?: string;
    portfolioContent?: PortfolioContent;

    // Optional links
    caseStudyLink?: string;
    externalLink?: string;

    isActive: boolean;
    order: number;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

// ============================================
// NETWORK PARTNERS (Jaringan)
// ============================================

export type PartnerStatus = 'Founding Chapter' | 'Strategic Partner' | 'Community Partner';

export interface NetworkPartner {
    id: string;
    name: string;
    city: string;
    region: string; // "Jawa Barat", "DKI Jakarta", "Banten", "Jawa Timur"
    status: PartnerStatus;
    specialization: string;
    established: number; // year
    imageUrl: string;
    imageId?: string;
    description?: string;
    website?: string;
    isActive: boolean;
    order: number;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

// ============================================
// PAGE IMAGES
// ============================================

export type PageName = 'home' | 'members' | 'achievements' | 'network' | 'about' | 'management';

export interface PageImage {
    id: string;
    pageName: PageName;
    section: string; // "hero", "gallery", "testimonials", dll
    imageUrl: string;
    imageId?: string; // Reference to image-library
    alt: string;
    caption?: string;
    order: number;
    isActive: boolean;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

// ============================================
// PROJECTS
// ============================================

export type ProjectStatus = 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
export type ProjectCategory = 'UI/UX Design' | 'Software Development' | 'Research' | 'Mobile App' | 'Web Development' | 'Machine Learning' | 'Other';

export interface Project {
    id: string;
    title: string;
    category: ProjectCategory;
    leader: string;
    leaderImageId?: string;
    contributors: number;
    tech: string[];
    lastActivity: string;
    status: ProjectStatus;
    summary: string;
    heroImageId?: string;
    projectUrl?: string;
    caseStudyUrl?: string;
    isFeatured: boolean;
    isActive: boolean;
    order: number;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================
// COUNCIL DIRECTIVES (Keputusan & Inisiatif)
// ============================================

export type DirectiveStatus = 'DISETUJUI' | 'DALAM PENGEMBANGAN' | 'SELESAI';

export interface CouncilDirective {
    id: string;
    title: string;
    description: string;
    status: DirectiveStatus;
    date: string; // YYYY-MM-DD
    leaderId: string; // Reference to TeamMember ID (e.g., "ketua-umum")
    order: number;
    isActive: boolean;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

// ============================================
// FORM DATA TYPES (for Create/Edit forms)
// ============================================

export type TeamMemberFormData = Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>;
export type AchievementFormData = Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>;
export type NetworkPartnerFormData = Omit<NetworkPartner, 'id' | 'createdAt' | 'updatedAt'>;
export type PageImageFormData = Omit<PageImage, 'id' | 'createdAt' | 'updatedAt'>;
export type CouncilDirectiveFormData = Omit<CouncilDirective, 'id' | 'createdAt' | 'updatedAt'>;
