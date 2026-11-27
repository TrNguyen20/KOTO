import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-lg border border-on-surface/10 p-8 text-center space-y-5">
        <div className="inline-flex w-14 h-14 rounded-xs border-2 border-primary/80 bg-primary-fixed/15 items-center justify-center font-serif text-xl font-bold text-primary mx-auto">
          迷子
        </div>
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-outline">
            404 · Page Not Found
          </div>
          <h1 className="font-serif text-2xl font-bold text-on-surface">
            This path is not in the archive
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Return to your KOTO command center to continue your JLPT study session.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </main>
  );
}
