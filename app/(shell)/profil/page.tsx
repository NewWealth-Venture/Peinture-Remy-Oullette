import { requireProfile } from "@/lib/auth/guards";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

export default async function ProfilPage() {
  const profile = await requireProfile();

  const displayName = profile.full_name?.trim() || "Mon profil";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-caption text-neutral-text-secondary" style={{ fontSize: "13px" }}>
          Profil
        </p>
        <h1 className="font-heading text-h2 text-neutral-text">{displayName}</h1>
        <p className="text-caption text-neutral-text-secondary mt-1 max-w-xl">
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </header>

      <section aria-labelledby="section-informations-personnelles" className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)] gap-6 items-start">
        <div className="space-y-4">
          <div className="border border-neutral-border rounded-xl bg-neutral-white shadow-sm p-4 sm:p-5">
            <h2 id="section-informations-personnelles" className="font-heading text-body font-semibold text-neutral-text mb-1">
              Informations personnelles
            </h2>
            <p className="text-caption text-neutral-text-secondary mb-3">
              Ces informations proviennent de votre profil d&apos;employé.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-caption" style={{ fontSize: "13px" }}>
              <div>
                <dt className="text-neutral-text-secondary">Nom complet</dt>
                <dd className="text-neutral-text font-medium mt-0.5">{profile.full_name || "Non renseigné"}</dd>
              </div>
              <div>
                <dt className="text-neutral-text-secondary">Rôle</dt>
                <dd className="text-neutral-text font-medium mt-0.5">
                  {profile.role === "patron" ? "Direction" : "Employé"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-text-secondary">Statut</dt>
                <dd className="text-neutral-text font-medium mt-0.5">
                  {profile.active ? "Actif" : "Inactif"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-text-secondary">Créé le</dt>
                <dd className="text-neutral-text mt-0.5">
                  {new Date(profile.created_at).toLocaleDateString("fr-CA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4" aria-labelledby="section-securite">
          <div>
            <h2 id="section-securite" className="font-heading text-body font-semibold text-neutral-text mb-1">
              Sécurité
            </h2>
            <p className="text-caption text-neutral-text-secondary mb-3">
              Gérez les paramètres sensibles liés à l&apos;accès à votre compte.
            </p>
            <ChangePasswordForm />
          </div>
        </div>
      </section>
    </div>
  );
}

