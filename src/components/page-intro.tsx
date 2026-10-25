type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium tracking-wide text-accent">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-balance text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted">{description}</p>
    </div>
  );
}
