import { notFound } from "next/navigation";
import { getDocumentById } from "@/app/actions/documents";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import type { DocumentContent, DocumentLanguage } from "@/lib/documents/types";

export default async function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getDocumentById(id);
  if (!data) notFound();

  return (
    <DocumentEditor
      documentId={data.document.id}
      initialTitle={data.document.title}
      initialLanguage={data.document.language as DocumentLanguage}
      initialStatus={data.document.status}
      initialContent={data.content as DocumentContent}
      template={data.template}
    />
  );
}
