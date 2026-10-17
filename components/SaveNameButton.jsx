'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readShortlist, toggleShortlist, isSaved, subscribeShortlist } from '../lib/shortlist.js';

// Save / unsave a name to the on-device shortlist (see lib/shortlist.js).
// Renders a neutral button during SSR and hydrates the saved state on mount,
// so the prerendered HTML is identical for every visitor.
export default function SaveNameButton({ item, className = '' }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(isSaved(readShortlist(), item));
    setReady(true);
    return subscribeShortlist((list) => setSaved(isSaved(list, item)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.r, item.s]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setSaved(isSaved(toggleShortlist(item), item))}
        aria-pressed={ready ? saved : undefined}
        className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 text-xs font-semibold transition ${
          saved
            ? 'border-nv-accent bg-nv-accent-subtle text-nv-accent'
            : 'border-nv-border bg-nv-surface text-nv-text-secondary hover:border-nv-accent/60 hover:text-nv-accent'
        }`}
      >
        <span aria-hidden="true">{saved ? '\u2665' : '\u2661'}</span>
        {saved ? 'Saved to shortlist' : 'Save to shortlist'}
      </button>
      {saved && (
        <Link href="/my-names" className="text-xs font-semibold text-nv-accent hover:underline">
          View shortlist
        </Link>
      )}
    </div>
  );
}
