"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <dl className="mt-12 space-y-4">
      {items.map((item, index) => (
        <div
          key={item.question}
          className="rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-sm"
        >
          <dt>
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
              aria-expanded={openIndex === index}
            >
              <span className="text-base font-semibold text-slate-900">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                  openIndex === index && "rotate-180 text-indigo-600"
                )}
              />
            </button>
          </dt>
          <dd
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              openIndex === index
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </div>
          </dd>
        </div>
      ))}
    </dl>
  );
}
