
import ProposalForm from './components/ProposalForm';
import { Card, CardContent } from '@/components/ui/card';

export default function SubmitProposalPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="container min-h-[80vh] py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              The Innovation Forge
              <span className="mt-2 block text-primary">Submit Your Vision</span>
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
              Wujudkan ide cemerlang Anda menjadi proyek berdampak nyata. Codebusters menyediakan dukungan, pendanaan, dan keahlian kolektif Telkom University dan Universitas Mercu Buana.
            </p>
          </div>

          <Card className="mb-12 bg-card/50">
            <CardContent className="p-8">
                <h2 className="font-headline text-2xl font-bold mb-4">Project Acceptance Mandate</h2>
                <ul className="space-y-3 text-muted-foreground list-disc list-inside">
                <li>
                    <span className="font-semibold text-foreground">Novelty & Impact:</span> Seberapa unik ide tersebut dan potensi dampaknya terhadap masyarakat/industri ICT.
                </li>
                <li>
                    <span className="font-semibold text-foreground">Technical Viability:</span> Kelayakan teknis dan keahlian tim (jika sudah ada) dari anggota TU/UMB.
                </li>
                <li>
                    <span className="font-semibold text-foreground">Strategic Alignment:</span> Sejauh mana proyek selaras dengan fokus inovasi Telkom University (ICT) atau kebutuhan mitra industri.
                </li>
                <li>
                    <span className="font-semibold text-foreground">Dukungan Institusi:</span> Proyek terpilih akan mendapat akses ke mentor dari kedua universitas.
                </li>
                </ul>
            </CardContent>
          </Card>
          
          <ProposalForm />

        </div>
      </div>
    </div>
  );
}
