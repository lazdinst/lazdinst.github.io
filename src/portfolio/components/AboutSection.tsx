import { PortfolioSection } from "./PortfolioSection";

interface AboutSectionProps {
  paragraphs: string[];
}

export function AboutSection({ paragraphs }: AboutSectionProps) {
  return (
    <PortfolioSection id="about" label="About">
      <div className="flex max-w-2xl flex-col gap-2">
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </PortfolioSection>
  );
}
