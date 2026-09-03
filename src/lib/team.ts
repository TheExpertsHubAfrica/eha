import { siteImages } from "@/lib/site-images";

export type TeamMember = {
  name: string;
  role: string;
  image: string;
  social?: {
    linkedin?: string;
    instagram?: string;
  };
};

export const teamMembers: TeamMember[] = [
  {
    name: "Prince Okoampah",
    role: "Founder & CEO",
    image: siteImages.about.princeOkoampah,
    social: {
      linkedin: "https://gh.linkedin.com/in/prince-okoampah-2b3ab01ba",
      instagram: "https://www.instagram.com/prince_okoampah",
    },
  },
  {
    name: "Stephen Gyan Bimpong",
    role: "Lead Developer",
    image: siteImages.about.gyanBimpong,
    social: {
      linkedin: "https://gh.linkedin.com/in/stephen-gyan-bimpong",
    },
  },
  {
    name: "Jennifer Dorh",
    role: "Executive Admin",
    image: siteImages.about.jenniferDorh,
  },
];
