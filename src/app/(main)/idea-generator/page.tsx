import IdeaGeneratorForm from './components/IdeaGeneratorForm';

export default function IdeaGeneratorPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
            Generator Ide Proyek Berbasis AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Buntu cari ide? Biarkan AI kami membantu Anda menemukan proyek berikutnya yang menarik berdasarkan keahlian dan minat Anda.
          </p>
        </div>
        <IdeaGeneratorForm />
      </div>
    </div>
  );
}
