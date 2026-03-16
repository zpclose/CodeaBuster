'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { executiveCouncil, divisionDirectors } from '@/app/management/page-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { TeamMember } from '@/types/content';
import { Upload, Database, CheckCircle, AlertCircle } from 'lucide-react';

export default function MigrateTeamData() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState('');
  const firestore = useFirestore();

  const migrateData = async () => {
    if (!firestore) {
      setResult('❌ Firestore not available');
      return;
    }

    setIsMigrating(true);
    setResult('  Starting migration...');

    try {
      const teamMembersCollection = collection(firestore, 'team-members');
      let successCount = 0;
      let errorCount = 0;

      // Function to convert hardcoded data to TeamMember format
      const convertToTeamMember = (member: any, tier: 'executive' | 'director', order: number): TeamMember => {
        const placeholderImage = PlaceHolderImages.find(p => p.id === member.imageId);

        return {
          id: member.id,
          name: member.name,
          role: member.role,
          university: member.university,
          quote: member.quote || '',
          bio: '',
          imageUrl: member.logoUrl || placeholderImage?.imageUrl || '',
          imageId: member.imageId,
          socials: member.socials,
          tier,
          order,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
      };

      // Migrate Executive Council
      setResult('📝 Migrating Executive Council...');
      for (let i = 0; i < executiveCouncil.length; i++) {
        try {
          const memberData = convertToTeamMember(executiveCouncil[i], 'executive', i);
          await setDoc(doc(teamMembersCollection, memberData.id), memberData);
          successCount++;
          console.log(`✅ Migrated executive: ${memberData.name}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Error migrating executive:`, error);
        }
      }

      // Migrate Division Directors
      setResult('📝 Migrating Division Directors...');
      for (let i = 0; i < divisionDirectors.length; i++) {
        try {
          const memberData = convertToTeamMember(divisionDirectors[i], 'director', i);
          await setDoc(doc(teamMembersCollection, memberData.id), memberData);
          successCount++;
          console.log(`✅ Migrated director: ${memberData.name}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Error migrating director:`, error);
        }
      }

      setResult(`✅ Migration Complete! ${successCount} success, ${errorCount} errors`);

    } catch (error) {
      console.error('Migration error:', error);
      setResult(`❌ Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Database className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Migrate Team Data</h3>
          <p className="text-sm text-muted-foreground">
            Move hardcoded team members to Firebase database
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <Button
          onClick={migrateData}
          disabled={isMigrating}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isMigrating ? 'Migrating...' : 'Migrate to Database'}
        </Button>

        {result && (
          <div className="p-3 rounded-lg bg-muted text-sm">
            <div className="flex items-start gap-2">
              {result.includes('❌') || result.includes('Error') ? (
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              ) : result.includes('✅') ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              )}
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
        <p className="font-medium text-yellow-800">⚠️ Important:</p>
        <p className="text-yellow-700 mt-1">
          This will migrate all hardcoded team members to Firebase. After migration,
          all team data will be managed through the admin portal.
        </p>
      </div>
    </div>
  );
}