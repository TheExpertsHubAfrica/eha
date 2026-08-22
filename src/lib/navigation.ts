export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/work-abroad", label: "Work Abroad" },
  { href: "/travel", label: "Travel Packages" },
  { href: "/study-abroad", label: "Study Abroad" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNav = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
    { href: "/blog", label: "Blog" },
  ],
  opportunities: [
    { href: "/work-abroad", label: "Work Abroad" },
    { href: "/study-abroad", label: "Study Abroad" },
    { href: "/travel", label: "Travel Packages" },
  ],
  services: [
    { href: "/services#work", label: "Job Opportunities" },
    { href: "/services#study", label: "Study Abroad Assistance" },
    { href: "/services#visa", label: "Visa Assistance" },
    { href: "/services#travel", label: "Travel Services" },
  ],
  support: [
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQs" },
    { href: "/contact?intent=help", label: "Application Help" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
} as const;
