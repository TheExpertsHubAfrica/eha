import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/ui/content-image";
import { teamMembers } from "@/lib/team";

export function TeamSection() {
  return (
    <div className="mt-14">
      <p className="eyebrow">Our team</p>
      <div className="gold-rule mt-3" aria-hidden="true" />
      <h2 className="mt-4 text-2xl font-bold text-black">The people behind TEHA.</h2>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <li
            key={member.name}
            className="flex h-full flex-col border border-border bg-white"
          >
            <ContentImage
              src={member.image}
              alt={`${member.name}, ${member.role} at The Experts Hub Africa`}
              aspect="portrait"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold text-black">{member.name}</h3>
              <p className="mt-1 text-sm font-medium text-gold-deep">{member.role}</p>
              {member.social ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {member.social.linkedin ? (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={member.social.linkedin}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        LinkedIn
                      </a>
                    </Button>
                  ) : null}
                  {member.social.instagram ? (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={member.social.instagram}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Instagram
                      </a>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
