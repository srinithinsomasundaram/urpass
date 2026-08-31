"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, Settings2 } from "lucide-react";
import { orgSchema, type OrgInput } from "@/lib/validations/organization";
import { updateOrganization, deleteOrganization } from "@/app/actions/organizations";
import type { Organization, OrgRole } from "@/types";

const inputCls =
  "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors bg-white placeholder:text-neutral-300 w-full";

function Field({ label, error, children, hint }: {
  label: string; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-800">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface Props {
  org: Organization;
  orgSlug: string;
  userRole: OrgRole;
}

export default function OrgSettingsClient({ org, orgSlug, userRole }: Props) {
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrgInput>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: org.name,
      website: org.website ?? "",
      contact_email: org.contact_email ?? "",
      contact_phone: org.contact_phone ?? "",
      brand_color: org.brand_color,
    },
  });

  async function onSubmit(data: OrgInput) {
    setServerError("");
    setSaved(false);
    const result = await updateOrganization(org.id, data);
    if (result?.error) { setServerError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleDelete() {
    if (deleteConfirm !== org.name) {
      setDeleteError("Organization name doesn't match.");
      return;
    }
    setDeleting(true);
    const result = await deleteOrganization(org.id, orgSlug);
    if (result?.error) { setDeleteError(result.error); setDeleting(false); }
  }

  return (
    <div className="space-y-6">
      {/* General settings */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-brand" />
          </div>
          <p className="text-sm font-bold text-neutral-900">General</p>
        </div>

        <Field label="Organization name *" error={errors.name?.message}>
          <input {...register("name")} className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Website" error={errors.website?.message}>
            <input {...register("website")} placeholder="https://example.com" className={inputCls} />
          </Field>
          <Field label="Contact email" error={errors.contact_email?.message}>
            <input {...register("contact_email")} type="email" className={inputCls} />
          </Field>
        </div>

        <Field label="Contact phone">
          <input {...register("contact_phone")} className={inputCls} />
        </Field>

        <Field label="Brand color" hint="Accent color used across the organization">
          <div className="flex items-center gap-3">
            <input {...register("brand_color")} type="color" className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5" />
            <input {...register("brand_color")} placeholder="#6D28D9" className={inputCls} />
          </div>
        </Field>

        {serverError && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3">{serverError}</p>}
        {saved && <p className="text-xs text-green-600 bg-green-50 rounded-xl px-4 py-3">Settings saved successfully.</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2.5 px-6 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" }}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Save changes
        </button>
      </form>

      {/* Danger zone — owner only */}
      {userRole === "owner" && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-red-100">
          <div className="flex items-center gap-3 pb-4 border-b border-red-100">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm font-bold text-red-600">Danger zone</p>
          </div>

          <p className="text-sm text-neutral-600 leading-relaxed">
            Deleting this organization is irreversible. All events will be unlinked and cannot be recovered.
            Type <strong>{org.name}</strong> to confirm.
          </p>

          <input
            value={deleteConfirm}
            onChange={(e) => { setDeleteConfirm(e.target.value); setDeleteError(""); }}
            placeholder={`Type "${org.name}" to confirm`}
            className="border border-red-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 transition-colors bg-white w-full placeholder:text-neutral-300"
          />

          {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}

          <button
            onClick={handleDelete}
            disabled={deleting || deleteConfirm !== org.name}
            className="py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete organization
          </button>
        </div>
      )}
    </div>
  );
}
