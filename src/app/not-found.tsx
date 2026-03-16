import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <h1 className="text-[10rem] font-bold leading-none tracking-tighter text-muted-foreground/20">
          404
        </h1>
        <p className="text-2xl font-medium">This page could not be found.</p>
        <p className="text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
