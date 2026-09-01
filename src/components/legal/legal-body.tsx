import { parseLegalBody } from "@/lib/legal/format-body";

export function LegalBody({ body }: { body: string }) {
  const blocks = parseLegalBody(body);

  return (
    <div className="legal-body space-y-5">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}-${block.type === "ul" ? block.items[0]?.slice(0, 24) : block.text.slice(0, 24)}`;

        if (block.type === "h2") {
          return (
            <h2 key={key} className="pt-2 text-xl font-semibold text-navy">
              {block.text}
            </h2>
          );
        }

        if (block.type === "h3") {
          return (
            <h3 key={key} className="pt-1 text-lg font-semibold text-navy">
              {block.text}
            </h3>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={key} className="list-disc space-y-2 pl-5">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key} className="leading-relaxed text-fg-soft">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
