"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Copy, Check, Eye, EyeOff, AlertCircle, Key } from "lucide-react";
import { createApiKey, revokeApiKey, deleteApiKey } from "@/app/actions/api-keys";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
      title="Copy key"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-neutral-400" />
      )}
    </button>
  );
}

function NewKeyBanner({ rawKey, onDismiss }: { rawKey: string; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">API key created</p>
          <p className="text-xs text-green-700 mt-0.5">
            Copy this key now — it won&apos;t be shown again.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white border border-green-200 rounded-xl px-3 py-2.5 font-mono text-xs text-neutral-700 mb-3">
        <span className="flex-1 truncate">
          {visible ? rawKey : `${rawKey.slice(0, 16)}${"•".repeat(40)}`}
        </span>
        <button
          onClick={() => setVisible(!visible)}
          className="p-1 rounded hover:bg-neutral-100 transition-colors"
        >
          {visible ? <EyeOff className="w-3.5 h-3.5 text-neutral-400" /> : <Eye className="w-3.5 h-3.5 text-neutral-400" />}
        </button>
        <CopyButton value={rawKey} />
      </div>
      <button onClick={onDismiss} className="text-xs text-green-700 hover:underline underline-offset-2">
        I&apos;ve copied it, dismiss
      </button>
    </div>
  );
}

export default function ApiKeyManager({ keys: initialKeys }: { keys: ApiKeyRow[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError("");
    const result = await createApiKey(newKeyName.trim());
    setCreating(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setNewRawKey(result.key);
    setNewKeyName("");
    setShowForm(false);
    // Optimistically add placeholder
    setKeys((prev) => [
      {
        id: result.id,
        name: newKeyName.trim(),
        key_prefix: result.key.slice(0, 16),
        permissions: ["events:read", "attendees:read"],
        is_active: true,
        last_used_at: null,
        expires_at: null,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    });
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      await revokeApiKey(id);
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, is_active: false } : k)));
    });
  }

  return (
    <div>
      {newRawKey && (
        <NewKeyBanner rawKey={newRawKey} onDismiss={() => setNewRawKey(null)} />
      )}

      {/* Create button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity mb-6"
          style={{ background: "#6D28D9" }}
        >
          <Plus className="w-4 h-4" />
          Create API key
        </button>
      ) : (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-neutral-100 rounded-2xl p-5 mb-6 flex flex-col gap-3"
        >
          <p className="text-sm font-semibold text-neutral-800">New API key</p>
          <input
            type="text"
            placeholder="e.g. Production, Zapier, Internal app"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors"
            required
            minLength={2}
            maxLength={64}
            autoFocus
          />
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "#6D28D9" }}
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-4 py-2 rounded-xl text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-neutral-300" />
          </div>
          <p className="text-sm font-medium text-neutral-700 mb-1">No API keys yet</p>
          <p className="text-xs text-neutral-400">Create a key to start integrating with URPASS.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {keys.map((k) => (
            <div
              key={k.id}
              className="bg-white border border-neutral-100 rounded-2xl p-5 flex items-start gap-4"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: k.is_active ? "#f5f3ff" : "#f5f5f5", border: `1px solid ${k.is_active ? "#ddd6fe" : "#e5e5e5"}` }}
              >
                <Key className={`w-4 h-4 ${k.is_active ? "text-brand" : "text-neutral-300"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{k.name}</p>
                  {!k.is_active && (
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
                      Revoked
                    </span>
                  )}
                </div>
                <code className="text-xs font-mono text-neutral-500">
                  {k.key_prefix}••••••••••••••••••••••••••••••••••••••••
                </code>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-neutral-400">
                    Created {formatDate(k.created_at)}
                  </p>
                  <span className="text-neutral-200">·</span>
                  <p className="text-xs text-neutral-400">
                    Last used: {formatDate(k.last_used_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {k.permissions.map((p) => (
                    <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {k.is_active && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    disabled={isPending}
                    className="text-xs text-neutral-400 hover:text-amber-600 transition-colors px-2 py-1 rounded-lg hover:bg-amber-50"
                  >
                    Revoke
                  </button>
                )}
                <button
                  onClick={() => handleDelete(k.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete key"
                >
                  <Trash2 className="w-3.5 h-3.5 text-neutral-300 hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl">
        <p className="text-xs font-semibold text-neutral-700 mb-2">Quick usage</p>
        <pre className="text-xs font-mono text-neutral-500 overflow-x-auto whitespace-pre-wrap">
{`curl https://urpass.space/api/v1/events \\
  -H "Authorization: Bearer urp_live_..."`}
        </pre>
      </div>
    </div>
  );
}
