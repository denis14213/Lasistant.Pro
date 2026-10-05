import { useSuspenseQuery } from '@tanstack/react-query';
import { faqQuery } from '@/api';
import { Accordion, Container, Eyebrow, Section, TextLink } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { FaqAnswer } from './FaqAnswer';

interface FaqExcerptProps {
  /** Thème de la FAQ à afficher */
  categoryId: string;
  title: string;
  /** Nombre de questions affichées */
  limit?: number;
}

/** Sélection de questions fréquentes en bas d'une page de service. */
export function FaqExcerpt({ categoryId, title, limit = 3 }: FaqExcerptProps) {
  const { data } = useSuspenseQuery(faqQuery());
  const items = data.items.filter((item) => item.categoryId === categoryId).slice(0, limit);
  if (items.length === 0) return null;

  return (
    <Section bordered aria-labelledby="faq-extrait">
      <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
        <div className="flex flex-col gap-5">
          <Eyebrow>Questions fréquentes</Eyebrow>
          <h2
            id="faq-extrait"
            className="text-[clamp(1.875rem,2.8vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.032em] max-[359px]:text-[min(1.875rem,9.3vw)]"
          >
            {title}
          </h2>
          <TextLink to={ROUTES.faq} arrow>
            Toutes les questions
          </TextLink>
        </div>
        <Accordion
          defaultOpenId={items[0]?.id ?? null}
          items={items.map((item) => ({
            id: item.id,
            title: item.question,
            content: <FaqAnswer item={item} />,
          }))}
        />
      </Container>
    </Section>
  );
}
