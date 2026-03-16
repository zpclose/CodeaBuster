import type { Metadata } from 'next';
import { Construction, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Under Maintenance — Codebusters',
    description: 'Situs sedang dalam pemeliharaan. Kami akan segera kembali.',
};

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8">

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <Construction className="h-12 w-12 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <Clock className="h-3 w-3 text-white" />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-12 bg-primary/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Dalam Pemeliharaan</span>
                        <div className="h-px w-12 bg-primary/30" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tight">
                        Sedang Diperbaiki
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Situs <strong>Codebusters</strong> saat ini sedang dalam pemeliharaan untuk memberikan pengalaman yang lebih baik.
                        Kami akan segera kembali.
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-border/50 pt-8">
                    <p className="text-sm text-muted-foreground">
                        Ada keperluan mendesak? Hubungi kami melalui email atau media sosial Codebusters.
                    </p>
                </div>

                {/* Admin link */}
                <div className="pt-2">
                    <a
                        href="/admin/login"
                        className="inline-flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                        Admin Login <ArrowRight className="h-3 w-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
