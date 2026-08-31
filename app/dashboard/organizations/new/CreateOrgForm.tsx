"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import { orgSchema, type OrgInput } from "@/lib/validations/organization";
import { createOrganization } from "@/app/actions/organizations";

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

export default function CreateOrgForm() {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrgInput>({
    resolver: zodResolver(orgSchema),
    defaultValues: { brand_color: "#6D28D9" },
  });

  async function onSubmit(data: OrgInput) {
    setServerError("");
    const result = await createOrganization(data);
    if (result?.error) setServerError(result.error);
  }

  return (
    <div className="max-w-2xl mx-auto page-in space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/organizations"
          className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Create organization</h1>
          <p className="text-sm text-neutral-400">Set up a workspace for your team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Organization details</p>
            <p className="text-xs text-neutral-400">Basic information about your organization</p>
          </div>
        </div>

        <Field label="Organization name *" error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="ABC Engineering College"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Website" error={errors.website?.message}>
            <input
              {...register("website")}
              placeholder="https://example.com"
              className={inputCls}
            />
          </Field>
          <Field label="Contact email" error={errors.contact_email?.message}>
            <input
              {...register("contact_email")}
              type="email"
              placeholder="info@example.com"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Contact phone" error={errors.contact_phone?.message}>
          <input
            {...register("contact_phone")}
            placeholder="+91 98765 43210"
            className={inputCls}
          />
        </Field>

        <Field label="Brand color" hint="Used as the accent color for your organization">
          <div className="flex items-center gap-3">
            <input
              {...register("brand_color")}
              type="color"
              className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
            />
            <input
              {...register("brand_color")}
              placeholder="#6D28D9"
              className={inputCls}
            />
          </div>
        </Field>

        {serverError && (
          <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3">{serverError}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/organizations"
            className="flex-1 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" }}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create organization
          </button>
        </div>
      </form>
    </div>
  );
}
