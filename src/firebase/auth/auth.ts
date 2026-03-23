'use client';

import {
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  verifyBeforeUpdateEmail as firebaseVerifyBeforeUpdateEmail,
  type UserCredential,
  type Auth,
  type User,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, query, collection, where, getDocs, type Firestore } from 'firebase/firestore';
import type { FormValues as RegisterFormValues } from '@/app/(main)/register/components/RegisterForm';

export async function sendVerificationEmail(user: any) {
  if (user) {
    console.log("Sending verification email to:", user.email);
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/action`,
      handleCodeInApp: true,
    };
    try {
      await firebaseSendEmailVerification(user, actionCodeSettings);
      console.log("Verification email sent successfully");
    } catch (error: any) {
      console.error("Firebase sendEmailVerification error:", error.code, error.message);
      throw error;
    }
  }
}

export async function sendPasswordResetEmail(auth: Auth, email: string) {
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/action`,
    handleCodeInApp: true,
  };
  await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
}

export async function sendEmailChangeVerification(user: User, newEmail: string) {
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/action`,
    handleCodeInApp: true,
  };
  await firebaseVerifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
}

// This function is not directly used for registration anymore but is kept for reference.
// The main registration logic is now within signUpWithEmailAndPassword.
export async function submitRegistration(
  firestore: Firestore,
  data: any // Keeping this generic for now
): Promise<void> {
  // This can be used for a separate admin-reviewed registration process if needed later.
  console.log("Submitting registration for admin review:", data);
}

export async function signIn(auth: Auth, email: string, pass: string) {
  return firebaseSignInWithEmailAndPassword(auth, email, pass);
}

export async function signout(auth: Auth) {
  return firebaseSignOut(auth);
}

export async function signUpWithEmailAndPassword(
  auth: Auth,
  firestore: Firestore,
  data: RegisterFormValues
): Promise<UserCredential> {
  // Clean the email: trim and lowercase
  const cleanEmail = data.email.trim().toLowerCase();

  // Check if email already exists in Firestore
  const emailQuery = query(collection(firestore, 'users'), where('email', '==', cleanEmail));
  const emailSnapshot = await getDocs(emailQuery);

  if (!emailSnapshot.empty) {
    throw { code: 'auth/email-already-in-use', message: 'Email sudah terdaftar' };
  }

  const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, cleanEmail, data.password);
  const user = userCredential.user;

  const defaultAvatarUrl = `https://avatar.vercel.sh/${user.uid}.png`;

  // Update auth profile
  await updateProfile(user, {
    displayName: data.fullName,
    photoURL: defaultAvatarUrl
  });

  // Create user profile in Firestore
  await setDoc(doc(firestore, 'users', user.uid), {
    uid: user.uid,
    email: cleanEmail,
    fullName: data.fullName,
    nim: data.nim,
    institution: data.institution,
    major: data.major,
    phone: data.phone,
    avatarUrl: defaultAvatarUrl,
    role: 'user', // A default role for all new users
    technicalSkills: {
      languages: data.languages.map(lang => ({ name: lang, proficiency: 50 })), // Default proficiency
      specializations: [data.specialization],
      skillLevel: data.skillLevel,
      certifications: [],
    },
    links: {
      github: data.portfolioUrl,
      linkedin: data.linkedinUrl,
      email: `mailto:${cleanEmail}`,
    },
    bio: data.motivation,
    communityEngagement: {
      commitment: data.commitment,
      status: 'Codebusters Applicant',
      // Default empty values for profile page
      mentorship: 'N/A',
      workshopsAttended: 0,
      hackathonsJoined: 0,
      badges: [],
    },
    projectContributions: [],
    quickStats: {
      projects: 0,
      contributions: 0,
      rank: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userCredential;
}
