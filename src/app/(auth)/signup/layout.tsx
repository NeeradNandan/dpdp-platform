import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Yojak account and start automating DPDP Act compliance. Free trial available — no credit card required.",
  alternates: { canonical: "/signup" },
  openGraph: {
    title: "Get Started with Yojak — Free Trial",
    description:
      "Sign up to automate consent management, data mapping, and grievance redressal for the DPDP Act 2023.",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
