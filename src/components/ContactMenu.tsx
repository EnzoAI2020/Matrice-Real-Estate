import { MessageCircle, Mail, MessageSquare } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const opzioni = [
  {
    label: "WhatsApp",
    href: "https://wa.me/393457603610",
    external: true,
    Icon: MessageCircle,
  },
  {
    label: "Email",
    href: "mailto:info@matricegroup.com",
    external: false,
    Icon: Mail,
  },
  {
    label: "SMS",
    href: "sms:+393457603610",
    external: false,
    Icon: MessageSquare,
  },
];

export function ContactMenu({
  className,
  label = "Scrivici ora",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-background transition-colors hover:bg-flame hover:text-flame-foreground",
          className,
        )}
      >
        {label}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="w-[min(15rem,calc(100vw-2rem))] rounded-none border border-white/15 bg-card p-2"
      >
        <div className="flex flex-col">
          {opzioni.map(({ label: l, href, external, Icon }) => (
            <a
              key={l}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-3 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:bg-white/5 hover:text-flame"
            >
              <Icon className="size-4" aria-hidden="true" />
              {l}
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
