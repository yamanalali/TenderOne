import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyProfile } from "@/app/actions/company-profile";
import { DocumentCanvas } from "@/components/documents/DocumentCanvas";
import { PrintButton } from "@/components/print-button";
import { BackLink } from "@/components/ui/back-link";
import { getProfileTemplate } from "@/lib/company-profile-templates";
import { getDocumentTemplate } from "@/lib/documents/registry";
import { companyToSnapshot } from "@/lib/documents/types";
import type { DocumentLanguage, ProfileDocumentContent } from "@/lib/documents/types";

export default async function CompanyProfileViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCompanyProfile(id);
  if (!data?.company || !data.profile) notFound();

  const { company, profile } = data;
  const profileTemplate = getProfileTemplate(profile.templateKey);
  const template = getDocumentTemplate(profileTemplate.key);
  const language = profile.language as DocumentLanguage;

  const content: ProfileDocumentContent = {
    kind: "company_profile",
    company: companyToSnapshot(company),
    tagline: "شريك موثوق للعطاءات والمشاريع المؤسسية",
    showAbout: true,
    showServices: true,
    showExperience: true,
    showContact: true,
  };

  return (
    <div className="space-y-4">
      <BackLink href="/company-profile" label="رجوع إلى هوية الشركة" />
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-amber-600">{template.nameAr}</p>
          <h1 className="text-2xl font-black text-[#071426]">
            {profile.title || "ملف تعريف الشركة"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            هذه معاينة سريعة. للتعديل الكامل استخدم{" "}
            <Link href="/templates?type=company_profile" className="font-bold text-amber-700 hover:underline">
              مستنداتي / معرض التصاميم
            </Link>
            .
          </p>
        </div>
        <PrintButton documentTitle={profile.title || template.nameAr} />
      </div>

      <div className="document-print-root overflow-auto rounded-3xl border border-slate-200 bg-slate-100/80 p-4 md:p-6">
        <DocumentCanvas content={content} template={template} language={language} />
      </div>
    </div>
  );
}
