import { useEffect, useState } from "react";

// Minimal draft state helper: init from prefill/defaults, sync on prefill change.
export function useBlockForm<TDraft>({
  prefill,
  defaults,
}: {
  prefill: TDraft | null;
  defaults: TDraft;
}) {
  // Initialize once (mount)
  const [draft, setDraft] = useState<TDraft>(() => prefill ?? defaults);

  // Reset when the prefill reference changes (switching edited item / mode)
  useEffect(() => {
    setDraft(prefill ?? defaults);
  }, [prefill, defaults]);

  function setField<K extends keyof TDraft>(key: K, value: TDraft[K]) {
    setDraft((d) => ({ ...(d as any), [key]: value } as TDraft));
  }

  return {
    draft,
    setDraft,
    setField,
    reset: () => setDraft(defaults),
  } as const;
}
