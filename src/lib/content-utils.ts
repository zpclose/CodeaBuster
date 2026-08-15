import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    serverTimestamp,
    Firestore,
} from 'firebase/firestore';
import { deleteImage } from '@/lib/storage-utils';
import type {
    TeamMember,
    TeamMemberFormData,
    Achievement,
    AchievementFormData,
    NetworkPartner,
    NetworkPartnerFormData,
    PageImage,
    PageImageFormData,
    Project,
    ProjectFormData,
    CouncilDirectiveFormData,
    LiveEvent,
    LiveEventFormData,
} from '@/types/content';

// ============================================
// TEAM MEMBERS CRUD
// ============================================

export async function createTeamMember(
    firestore: Firestore,
    data: TeamMemberFormData
): Promise<string> {
    const membersCollection = collection(firestore, 'team-members');
    const docRef = await addDoc(membersCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateTeamMember(
    firestore: Firestore,
    id: string,
    data: Partial<TeamMemberFormData>
): Promise<void> {
    const memberRef = doc(firestore, 'team-members', id);
    
    // Check if image is being changed - delete old image from storage
    if (data.imageId) {
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
            const memberData = memberSnap.data() as TeamMember;
            if (memberData.imageId && memberData.imageId !== data.imageId) {
                try {
                    await deleteImage(`images/${memberData.imageId}`);
                } catch (error) {
                    console.warn('Failed to delete old team member image from storage:', error);
                }
            }
        }
    }
    
    await updateDoc(memberRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteTeamMember(
    firestore: Firestore,
    id: string
): Promise<void> {
    const memberRef = doc(firestore, 'team-members', id);
    
    // Get the member data first to check for image
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
        const memberData = memberSnap.data() as TeamMember;
        
        // Delete image from storage if exists
        if (memberData.imageId) {
            try {
                await deleteImage(`images/${memberData.imageId}`);
            } catch (error) {
                console.warn('Failed to delete team member image from storage:', error);
            }
        }
    }
    
    await deleteDoc(memberRef);
}

export async function toggleTeamMemberActive(
    firestore: Firestore,
    id: string,
    isActive: boolean
): Promise<void> {
    await updateTeamMember(firestore, id, { isActive });
}

// ============================================
// ACHIEVEMENTS CRUD
// ============================================

export async function createAchievement(
    firestore: Firestore,
    data: AchievementFormData
): Promise<string> {
    const achievementsCollection = collection(firestore, 'achievements');
    const docRef = await addDoc(achievementsCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateAchievement(
    firestore: Firestore,
    id: string,
    data: Partial<AchievementFormData>
): Promise<void> {
    const achievementRef = doc(firestore, 'achievements', id);
    
    // Check if thumbnail or curator image is being changed - delete old images from storage
    if (data.thumbnailId || data.curatorImageId) {
        const achievementSnap = await getDoc(achievementRef);
        if (achievementSnap.exists()) {
            const achievementData = achievementSnap.data() as Achievement;
            
            // Delete old thumbnail if changed
            if (data.thumbnailId && achievementData.thumbnailId && achievementData.thumbnailId !== data.thumbnailId) {
                try {
                    await deleteImage(`images/${achievementData.thumbnailId}`);
                } catch (error) {
                    console.warn('Failed to delete old achievement thumbnail from storage:', error);
                }
            }
            
            // Delete old curator image if changed
            if (data.curatorImageId && achievementData.curatorImageId && achievementData.curatorImageId !== data.curatorImageId) {
                try {
                    await deleteImage(`images/${achievementData.curatorImageId}`);
                } catch (error) {
                    console.warn('Failed to delete old achievement curator image from storage:', error);
                }
            }
        }
    }
    
    await updateDoc(achievementRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteAchievement(
    firestore: Firestore,
    id: string
): Promise<void> {
    const achievementRef = doc(firestore, 'achievements', id);
    
    // Get the achievement data first to check for image
    const achievementSnap = await getDoc(achievementRef);
    if (achievementSnap.exists()) {
        const achievementData = achievementSnap.data() as Achievement;
        
        // Delete thumbnail from storage if exists
        if (achievementData.thumbnailId) {
            try {
                await deleteImage(`images/${achievementData.thumbnailId}`);
            } catch (error) {
                console.warn('Failed to delete achievement thumbnail from storage:', error);
            }
        }
        
        // Delete curator image from storage if exists
        if (achievementData.curatorImageId) {
            try {
                await deleteImage(`images/${achievementData.curatorImageId}`);
            } catch (error) {
                console.warn('Failed to delete achievement curator image from storage:', error);
            }
        }
    }
    
    await deleteDoc(achievementRef);
}

export async function toggleAchievementActive(
    firestore: Firestore,
    id: string,
    isActive: boolean
): Promise<void> {
    await updateAchievement(firestore, id, { isActive });
}

// ============================================
// NETWORK PARTNERS CRUD
// ============================================

export async function createNetworkPartner(
    firestore: Firestore,
    data: NetworkPartnerFormData
): Promise<string> {
    const partnersCollection = collection(firestore, 'network-partners');
    const docRef = await addDoc(partnersCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateNetworkPartner(
    firestore: Firestore,
    id: string,
    data: Partial<NetworkPartnerFormData>
): Promise<void> {
    const partnerRef = doc(firestore, 'network-partners', id);
    
    // Check if image is being changed - delete old image from storage
    if (data.imageId) {
        const partnerSnap = await getDoc(partnerRef);
        if (partnerSnap.exists()) {
            const partnerData = partnerSnap.data() as NetworkPartner;
            if (partnerData.imageId && partnerData.imageId !== data.imageId) {
                try {
                    await deleteImage(`images/${partnerData.imageId}`);
                } catch (error) {
                    console.warn('Failed to delete old partner image from storage:', error);
                }
            }
        }
    }
    
    await updateDoc(partnerRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteNetworkPartner(
    firestore: Firestore,
    id: string
): Promise<void> {
    const partnerRef = doc(firestore, 'network-partners', id);
    
    // Get the partner data first to check for image
    const partnerSnap = await getDoc(partnerRef);
    if (partnerSnap.exists()) {
        const partnerData = partnerSnap.data() as NetworkPartner;
        
        // Delete image from storage if exists
        if (partnerData.imageId) {
            try {
                await deleteImage(`images/${partnerData.imageId}`);
            } catch (error) {
                console.warn('Failed to delete partner image from storage:', error);
            }
        }
    }
    
    await deleteDoc(partnerRef);
}

export async function toggleNetworkPartnerActive(
    firestore: Firestore,
    id: string,
    isActive: boolean
): Promise<void> {
    await updateNetworkPartner(firestore, id, { isActive });
}

// ============================================
// PAGE IMAGES CRUD
// ============================================

export async function createPageImage(
    firestore: Firestore,
    data: PageImageFormData
): Promise<string> {
    const imagesCollection = collection(firestore, 'page-images');
    const docRef = await addDoc(imagesCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updatePageImage(
    firestore: Firestore,
    id: string,
    data: Partial<PageImageFormData>
): Promise<void> {
    const imageRef = doc(firestore, 'page-images', id);
    await updateDoc(imageRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deletePageImage(
    firestore: Firestore,
    id: string
): Promise<void> {
    const imageRef = doc(firestore, 'page-images', id);
    await deleteDoc(imageRef);
}


export async function togglePageImageActive(
    firestore: Firestore,
    id: string,
    isActive: boolean
): Promise<void> {
    await updatePageImage(firestore, id, { isActive });
}

// ============================================
// COUNCIL DIRECTIVES CRUD
// ============================================

export async function createCouncilDirective(
    firestore: Firestore,
    data: CouncilDirectiveFormData
): Promise<string> {
    const directivesCollection = collection(firestore, 'council-directives');
    const docRef = await addDoc(directivesCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateCouncilDirective(
    firestore: Firestore,
    id: string,
    data: Partial<CouncilDirectiveFormData>
): Promise<void> {
    const directiveRef = doc(firestore, 'council-directives', id);
    await updateDoc(directiveRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteCouncilDirective(
    firestore: Firestore,
    id: string
): Promise<void> {
    const directiveRef = doc(firestore, 'council-directives', id);
    await deleteDoc(directiveRef);
}

export async function toggleCouncilDirectiveActive(
    firestore: Firestore,
    id: string,
    isActive: boolean
): Promise<void> {
    await updateCouncilDirective(firestore, id, { isActive });
}

// ============================================
// PROJECTS CRUD
// ============================================

export async function createProject(
    firestore: Firestore,
    data: Omit<import('@/types/content').Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const projectsCollection = collection(firestore, 'projects');
    const docRef = await addDoc(projectsCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateProject(
    firestore: Firestore,
    id: string,
    data: Partial<Omit<import('@/types/content').Project, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    const projectRef = doc(firestore, 'projects', id);
    await updateDoc(projectRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteProject(
    firestore: Firestore,
    id: string
): Promise<void> {
    const projectRef = doc(firestore, 'projects', id);
    await deleteDoc(projectRef);
}

export async function toggleProjectActive(
    firestore: Firestore,
    id: string,
    isActive: boolean
): Promise<void> {
    await updateProject(firestore, id, { isActive });
}

export async function toggleProjectFeatured(
    firestore: Firestore,
    id: string,
    isFeatured: boolean
): Promise<void> {
    await updateProject(firestore, id, { isFeatured });
}

// ============================================
// LIVE EVENTS CRUD
// ============================================

export async function createLiveEvent(
    firestore: Firestore,
    data: LiveEventFormData
): Promise<string> {
    const eventsCollection = collection(firestore, 'live-events');
    const docRef = await addDoc(eventsCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateLiveEvent(
    firestore: Firestore,
    id: string,
    data: Partial<LiveEventFormData>
): Promise<void> {
    const eventRef = doc(firestore, 'live-events', id);

    // Hapus gambar lama dari R2 kalau imageId berubah
    if (data.imageId) {
        const snap = await getDoc(eventRef);
        if (snap.exists()) {
            const old = snap.data() as LiveEvent;
            if (old.imageId && old.imageId !== data.imageId) {
                try {
                    await deleteImage(`images/${old.imageId}`);
                } catch (err) {
                    console.warn('Failed to delete old live event image:', err);
                }
            }
        }
    }

    await updateDoc(eventRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteLiveEvent(
    firestore: Firestore,
    id: string
): Promise<void> {
    const eventRef = doc(firestore, 'live-events', id);

    const snap = await getDoc(eventRef);
    if (snap.exists()) {
        const data = snap.data() as LiveEvent;
        if (data.imageId) {
            try {
                await deleteImage(`images/${data.imageId}`);
            } catch (err) {
                console.warn('Failed to delete live event image:', err);
            }
        }
    }

    await deleteDoc(eventRef);
}

export async function toggleLiveEventVisible(
    firestore: Firestore,
    id: string,
    isVisible: boolean
): Promise<void> {
    await updateLiveEvent(firestore, id, { isVisible });
}
