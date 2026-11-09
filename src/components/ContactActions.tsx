import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

export const CONTACT_EMAIL = "visibility@better-technologies.com";
const CALENDAR_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0sjmFn56dnkqi7939pqd9tAODgx-qskLHwHMfVouVaCPeaIb_AO-Y-jI0iBsmekVgyOMu8QODP?gv=true";

export function packageMailto(t: { mail: { subject: string; body: string } }, pkg: string) {
  const fill = (s: string) => s.replaceAll("{pkg}", pkg);
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(fill(t.mail.subject))}&body=${encodeURIComponent(fill(t.mail.body))}`;
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
