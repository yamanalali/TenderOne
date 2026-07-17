"use server";

import { z } from "zod";
import type { ActionState } from "@/app/actions/auth";
import { writeAuditLog } from "@/lib/audit";

const contactSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد غير صالح"),
  message: z.string().min(10, "الرسالة قصيرة جداً"),
});

export async function contactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  await writeAuditLog({
    actorId: null,
    action: "contact.inquiry",
    entityType: "contact_inquiry",
    metadata: parsed.data,
  });

  return {
    success: "تم استلام رسالتك. سيتواصل معك فريقنا في أقرب وقت.",
  };
}
