/**
 * Defines all manageable image slots organized by page category.
 * Each slot maps to a placeholder image ID and can be overridden via Firestore.
 */

export interface ImageSlot {
    slot: string;           // matches placeholder-images.json id
    label: string;          // human-readable label for admin UI
    description: string;    // short description for admin UI
}

export interface PageCategory {
    id: string;             // used as pageCategory in Firestore
    label: string;          // shown in admin tab
    emoji: string;
    slots: ImageSlot[];
}

export const PAGE_IMAGE_CATEGORIES: PageCategory[] = [
    {
        id: 'home',
        label: 'Home',
        emoji: '🏠',
        slots: [
            { slot: 'hero-background-main', label: 'Hero Background', description: 'Full-screen background image in the homepage hero section' },
            { slot: 'homepage-carousel-collaboration', label: 'Carousel — Kolaborasi', description: 'Carousel image in the About section (collaboration photo)' },
            { slot: 'homepage-carousel-mentorship', label: 'Carousel — Mentorship', description: 'Carousel image in the About section (mentorship photo)' },
            { slot: 'collage-chairperson-main', label: 'Collage Chairperson (Utama)', description: 'Main image in the Chairperson message collage' },
            { slot: 'collage-chairperson-secondary', label: 'Collage Chairperson (Sekunder)', description: 'Secondary image in the Chairperson message collage' },
            { slot: 'management-lacienta', label: 'Foto Chairperson', description: 'Portrait used under the Chairperson message as avatar' },
        ],
    },
    {
        id: 'global',
        label: 'Global / Logo',
        emoji: '🌐',
        slots: [
            { slot: 'site-logo', label: 'Logo Website (Header/Footer)', description: 'Logo utama yang ditampilkan di header dan footer website' },
            { slot: 'telkom-university-logo-potrait', label: 'Logo Telkom University', description: 'Telkom University logo shown throughout all pages' },
            { slot: 'mercu-buana-logo-square', label: 'Logo Universitas Mercu Buana', description: 'Universitas Mercu Buana logo shown throughout all pages' },
            { slot: 'impact-archive-logo', label: 'Logo Impact Archive', description: 'Custom logo displayed beside Impact Archive title in achievements page (e.g., Gryffindor logo)' },
        ],
    },
    {
        id: 'about',
        label: 'About',
        emoji: '📖',
        slots: [
            { slot: 'about-page-hero', label: 'Hero Campus', description: 'Telkom University campus image in the About page hero' },
            { slot: 'about-us-image', label: 'About Us Photo', description: 'Team collaboration photo in the about section' },
            { slot: 'about-us-decoration', label: 'Dekorasi Abstract', description: 'Abstract decorative image on the about page' },
            { slot: 'masterclass-speaker', label: 'Foto Pembicara', description: 'Portrait of an academic speaker on the about page' },
        ],
    },
    {
        id: 'programs',
        label: 'Programs',
        emoji: '📚',
        slots: [
            { slot: 'events-hero', label: 'Hero Events', description: 'Background or hero image on the programs/events section' },
            { slot: 'ai-ml-background', label: 'AI/ML Program Background', description: 'Background for the AI/ML specialist program card' },
            { slot: 'masterclass-speaker', label: 'Foto Pembicara', description: 'Speaker portrait in program listings' },
        ],
    },
    {
        id: 'projects',
        label: 'Projects',
        emoji: '🛠️',
        slots: [
            { slot: 'projects-hero', label: 'Hero Background', description: 'Background image in the Projects page hero' },
            { slot: 'project-ai-fintech', label: 'Proyek AI Fintech', description: 'Hero image for the AI fintech project' },
            { slot: 'project-blockchain-voting', label: 'Proyek Blockchain Voting', description: 'Hero image for the blockchain voting project' },
            { slot: 'project-cyber-security', label: 'Proyek Cyber Security', description: 'Hero image for the cyber security project' },
            { slot: 'case-study-hero', label: 'Case Study Hero', description: 'Smart city hero image for case studies' },
            { slot: 'project-iot-dashboard', label: 'Proyek IoT Dashboard', description: 'IoT dashboard mockup image' },
        ],
    },
    {
        id: 'auth',
        label: 'Auth',
        emoji: '🔐',
        slots: [
            { slot: 'auth-visual', label: 'Visual Login/Register', description: 'Abstract data network image shown on auth pages' },
        ],
    },
];

/** Flat lookup: slot ID → PageCategory + ImageSlot */
export function getSlotByID(slotId: string): { category: PageCategory; slot: ImageSlot } | undefined {
    for (const category of PAGE_IMAGE_CATEGORIES) {
        const slot = category.slots.find(s => s.slot === slotId);
        if (slot) return { category, slot };
    }
    return undefined;
}

/** All slot IDs as a flat list */
export const ALL_SLOT_IDS = PAGE_IMAGE_CATEGORIES.flatMap(c => c.slots.map(s => s.slot));
