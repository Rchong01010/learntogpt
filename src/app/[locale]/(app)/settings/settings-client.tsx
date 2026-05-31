'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  User,
  Mail,
  Crown,
  LogOut,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import type { SubscriptionStatus } from '@/types';

interface SettingsClientProps {
  initialDisplayName: string;
  email: string;
  subscription: SubscriptionStatus;
  memberSince: string;
}

export function SettingsClient({
  initialDisplayName,
  email,
  subscription,
  memberSince,
}: SettingsClientProps) {
  const router = useRouter();
  const t = useTranslations('settings');
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function handleSave() {
    const trimmed = displayName.trim().replace(/<[^>]*>/g, '');
    if (trimmed.length < 2 || trimmed.length > 50) {
      alert(t('displayNameValidation'));
      return;
    }

    setSaving(true);
    try {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_profiles')
        .update({ display_name: trimmed })
        .eq('user_id', user.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/sign-in');
  }

  async function handleManageSubscription() {
    setManagingSubscription(true);
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || t('failedToOpenPortal'));
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : t('somethingWentWrong'));
    } finally {
      setManagingSubscription(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return;
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || t('failedToDeleteAccount'));
      }
      window.location.href = '/';
    } catch (err) {
      alert(err instanceof Error ? err.message : t('somethingWentWrong'));
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{t('heading')}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t('subheading')}
        </p>
      </div>

      {/* Profile */}
      <div className="card-f-static overflow-hidden">
        <div className="border-b-[3px] border-ink px-5 py-3">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <User className="size-5" />
            {t('profileHeading')}
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            {t('profileSubheading')}
          </p>
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-bold text-ink">
              {t('displayNameLabel')}
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="block w-full max-w-sm rounded-xl border-[2px] border-ink bg-cream px-3 py-2 text-sm text-ink placeholder:text-text-secondary focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <Mail className="size-4" />
              {t('emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="block w-full max-w-sm rounded-xl border-[2px] border-ink/30 bg-linen px-3 py-2 text-sm text-text-secondary"
            />
            <p className="text-xs text-text-secondary">
              {t('emailManagedNote')}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-5 py-2 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917] disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="size-4" />
                {t('savedBang')}
              </>
            ) : saving ? t('savingEllipsis') : t('saveChanges')}
          </button>
        </div>
      </div>

      {/* Account / billing — wave 2 (GTM bible v2.0 §3): all courses are free.
          Stripe wiring stays dormant; the manage-subscription button is only
          shown to users with a historical Stripe subscription on file. */}
      <div className="card-f-static overflow-hidden">
        <div className="border-b-[3px] border-ink px-5 py-3">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Crown className="size-5 text-gold" />
            {t('subscriptionHeading')}
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            {t('subscriptionSubheading')}
          </p>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-2xl border-[2px] border-ink bg-linen p-4">
            <p className="font-bold text-ink">{t('allFreeHeading')}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {t('allFreeBody')}
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              {t('memberSince', { date: memberSince })}
            </p>
          </div>

          {subscription !== 'free' && (
            <button
              onClick={handleManageSubscription}
              disabled={managingSubscription}
              className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-cream px-5 py-2 text-sm font-bold text-ink transition-all hover:bg-linen disabled:opacity-50"
            >
              {managingSubscription ? t('loadingEllipsis') : t('manageSubscription')}
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-[2px] border-ink/10" />

      {/* Sign out */}
      <div className="flex items-center justify-between rounded-2xl border-[2px] border-ink bg-cream p-4">
        <div>
          <p className="font-bold text-ink">{t('signOutHeading')}</p>
          <p className="text-sm text-text-secondary">
            {t('signOutSubheading')}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-linen px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-cream"
        >
          <LogOut className="size-4" />
          {t('signOutButton')}
        </button>
      </div>

      {/* Delete account */}
      <div className="flex items-center justify-between rounded-2xl border-[2px] border-red-400/40 bg-red-50/50 p-4">
        <div>
          <p className="font-bold text-red-600">{t('deleteAccountHeading')}</p>
          <p className="text-sm text-text-secondary">
            {t('deleteAccountSubheading')}
          </p>
        </div>
        <button
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border-[2px] border-red-400 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
        >
          <Trash2 className="size-4" />
          {t('deleteButton')}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div className="card-f-static mx-4 w-full max-w-md p-6">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-red-600">
              <AlertTriangle className="size-5" />
              {t('deleteConfirmTitle')}
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              {t('deleteConfirmBody')}
            </p>
            <div className="mt-4 space-y-2">
              <label htmlFor="delete-confirm" className="text-sm font-bold text-ink">
                {t('deleteConfirmPrompt')}
              </label>
              <input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                className="block w-full rounded-xl border-[2px] border-ink bg-cream px-3 py-2 font-mono text-sm text-ink placeholder:text-text-secondary focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteConfirmText('');
                }}
                className="rounded-full border-[2px] border-ink bg-cream px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-linen"
              >
                {t('cancelButton')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmText !== 'DELETE'}
                className="rounded-full border-[2px] border-red-400 bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
              >
                {deletingAccount ? t('deletingEllipsis') : t('deleteConfirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
