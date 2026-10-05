import { Seo } from '@/components/seo/Seo';
import { AuthHeading } from '@/features/auth/AuthParts';
import { LoginForm } from '@/features/auth/LoginForm';

/** Connexion au back-office (cahier des charges § 8.1). */
export function Component() {
  return (
    <>
      <Seo title="Connexion" description="Connexion au back-office LASISTANT.PRO." noIndex />
      <AuthHeading eyebrow="Espace sécurisé" title="Connexion">
        Connectez-vous avec votre adresse professionnelle.
      </AuthHeading>
      <LoginForm />
    </>
  );
}
