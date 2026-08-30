"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Palette, Image as ImageIcon, Type, Eye, EyeOff } from "lucide-react";
import { updateBranding } from "@/app/actions/branding";

interface Props {
  initial: {
    org_name: string;
    brand_color: string;
    org_logo_url: string;
    hide_urpass_branding: boolean;
  };
  isPro: boolean;
  canHideBranding: boolean;
}

const inputCls =
  "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors bg-white placeholder:text-neutral-300 w-full";

function darken(hex: string, amount = 40): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function PassPreview({ orgName, brandColor, logoUrl }: { orgName: string; brandColor: string; logoUrl: string }) {
  const dark = darken(brandColor);
  const label = orgName.trim() || "Your Organisation";
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm max-w-xs mx-auto select-none">
      <div className="px-5 pt-5 pb-6" style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${dark} 100%)` }}>
        <div className="flex items-center gap-2 mb-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="logo" className="w-5 h-5 rounded object-cover" />
          )}
          <span className="text-[9px] font-bold tracking-widest uppercase text-white/60">
            {label} · EVENT PASS
          </span>
        </div>
        <p className="text-base font-bold text-white leading-snug">Annual Tech Summit 2026</p>
        <p className="text-[11px] text-white/60 mt-2">15 September 2026 · 10:00–18:00</p>
        <p className="text-[11px] text-white/60">SRM Institute, Chennai</p>
      </div>
      <div className="px-5 py-4 flex flex-col items-center gap-3">
        <div className="w-full text-center">
          <p className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 mb-0.5">Attendee</p>
          <p className="text-sm font-bold text-neutral-900">Arun Kumar</p>
          <p className="text-xs text-neutral-400">arun@example.com</p>
        </div>
        <div className="w-20 h-20 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-300 text-xs">
          QR code
        </div>
        <div
          className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white"
          style={{ background: brandColor }}
        >
          Valid · Show at entrance
        </div>
      </div>
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors disabled:opacity-40 ${
        enabled ? "bg-neutral-900" : "bg-neutral-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function BrandingForm({ initial, isPro, canHideBranding }: Props) {
  const [hideBranding, setHideBranding] = useState(initial.hide_urpass_branding);
  const [orgName, setOrgName]       = useState(initial.org_name);
  const [brandColor, setBrandColor] = useState(initial.brand_color);
  const [logoUrl, setLogoUrl]       = useState(initial.org_logo_url);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const result = await updateBranding({
      org_name: orgName,
      brand_color: brandColor,
      org_logo_url: logoUrl,
      hide_urpass_branding: hideBranding,
    });
    setSaving(false);
    if (result?.error) { setError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSave} className="flex flex-col gap-5">

        {/* ── Hide URPASS branding toggle ──────────────────── */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Hide URPASS branding</p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                When enabled, the &ldquo;Powered by URPASS&rdquo; footer and wordmark are removed from all
                passes and application pages.
              </p>
              {hideBranding && (
                <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Branding hidden — attendees see a clean, unbranded experience
                </div>
              )}
            </div>
            <Toggle
              enabled={hideBranding}
              onChange={setHideBranding}
              disabled={!canHideBranding}
            />
          </div>
          {!canHideBranding && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-4">
              Upgrade to Starter or Pro to hide URPASS branding.
            </p>
          )}
        </div>

        {/* ── Custom branding (Pro only) ────────────────────── */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800">Custom branding</h2>
            {!isPro && (
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Pro only
              </span>
            )}
          </div>

          {/* Org name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-neutral-400" />
              Organisation name
            </label>
            <input
              type="text"
              placeholder="e.g. SRM TechFest"
              className={inputCls}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              maxLength={64}
              disabled={!isPro}
            />
            <p className="text-xs text-neutral-400">
              Shown on passes in place of &ldquo;URPASS&rdquo;. Leave blank to show nothing.
            </p>
          </div>

          {/* Brand colour */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-neutral-400" />
              Brand colour
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-11 h-10 rounded-xl border border-neutral-200 cursor-pointer p-1 bg-white"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                disabled={!isPro}
              />
              <input
                type="text"
                className={`${inputCls} font-mono uppercase`}
                value={brandColor}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setBrandColor(val);
                }}
                maxLength={7}
                disabled={!isPro}
              />
            </div>
            <p className="text-xs text-neutral-400">
              Used for the pass header gradient and accent colours.
            </p>
          </div>

          {/* Logo URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
              Logo URL
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              className={inputCls}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              disabled={!isPro}
            />
            <p className="text-xs text-neutral-400">
              Direct link to a square logo (PNG/SVG, https). Shown next to your org name on passes.
            </p>
          </div>
        </div>

        {/* Preview toggle */}
        {isPro && (
          <button
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-2 text-sm text-brand hover:underline underline-offset-2 self-start"
          >
            {previewOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewOpen ? "Hide preview" : "Show pass preview"}
          </button>
        )}

        {previewOpen && isPro && (
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4 text-center">
              Pass preview
            </p>
            <PassPreview orgName={orgName} brandColor={brandColor} logoUrl={logoUrl} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "#6D28D9" }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : "Save branding"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
