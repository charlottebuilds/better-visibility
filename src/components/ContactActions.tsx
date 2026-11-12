import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

export const CONTACT_EMAIL = "visibility@better-technologies.com";
const CALENDAR_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0sjmFn56dnkqi7939pqd9tAODgx-qskLHwHMfVouVaCPeaIb_AO-Y-jI0iBsmekVgyOMu8QODP?gv=true";

export const whatsappLink = (text: string) => `https://wa.me/4917677883219?text=${encodeURIComponent(text)}`;

export function packageMailto(t: { mail: { subject: string; body: string } }, pkg: string, extra?: string) {
  const fill = (s: string) => s.replaceAll("{pkg}", pkg);
  const parts = fill(t.mail.body).split("\n\n");
  if (extra) parts.splice(2, 0, extra);
  const body = parts.join("\n\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(fill(t.mail.subject))}&body=${encodeURIComponent(body)}`;
}

export function contactMailto(t: { contactWays: { mailSubject: string; mailBody: string } }) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.contactWays.mailSubject)}&body=${encodeURIComponent(t.contactWays.mailBody)}`;
}

export function BookingDialog({ className, children }: { className?: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <Dialog>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl border-border bg-card p-4 sm:p-6">
        <DialogTitle className="font-display text-xl">{t.booking.title}</DialogTitle>
        <iframe
          src={CALENDAR_URL}
          title={t.booking.title}
          className="h-[70vh] w-full rounded-2xl border-0 bg-foreground"
          loading="lazy"
        />
      </DialogContent>
    </Dialog>
  );
}
