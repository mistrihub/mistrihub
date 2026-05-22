import type { Worker } from "@/types/worker";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function createWhatsAppUrl(worker: Worker) {
  const message = encodeURIComponent(
    `Hi ${worker.name}, I found your MistriHub.In profile and need help with ${worker.category}.`
  );

  return `https://wa.me/${worker.whatsapp}?text=${message}`;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}
