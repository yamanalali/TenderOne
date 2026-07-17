import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/marketing/page-hero";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="تواصل معنا"
        title="فريقنا جاهز لمساعدتك على الانطلاق"
        description="سواء كنت شركة تريد تفعيل خدمة واحدة، أو مؤسسة تحتاج منظومة كاملة لتجهيز المناقصات — تواصل معنا وابدأ بسرعة."
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: "البريد",
              value: "hello@tenderone.app",
            },
            {
              icon: Phone,
              title: "الهاتف",
              value: "+966 50 000 0000",
            },
            {
              icon: MapPin,
              title: "المقر",
              value: "الرياض، المملكة العربية السعودية",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/8 bg-white/[0.035] p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10">
                    <Icon className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      {item.title}
                    </p>
                    <p className="mt-1 font-black text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-[2rem] border border-white/8 bg-white/[0.035] p-7 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10">
              <MessageSquare className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">أرسل رسالة</h2>
              <p className="text-sm text-slate-500">
                سنعود إليك في أقرب وقت ممكن
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
