import { useState } from "react";
import AppShell from "../components/AppShell";
import { Field, Input, Select, Button } from "../components/Field";

// NOTE (parked feature): this screen is scaffolded per the SRS's AI Story
// Generation Engine (FR-16 → FR-33), but intentionally disabled for this
// phase. The form below captures the parameters the engine will eventually
// need (age, moral value, theme, length). Wiring it to an LLM + moderation
// pipeline is future work — see the project README.

const MORAL_VALUES = ["الصدق", "الأمانة", "الكرم", "احترام الكبار", "الصبر", "التعاون"];
const THEMES = ["المنزل", "المدرسة", "السوق", "بيت الجدّ والجدة", "الحي", "المسجد"];

export default function CreateStory() {
  const [moral, setMoral] = useState(MORAL_VALUES[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [age, setAge] = useState("6-9 سنوات");
  const [length, setLength] = useState("متوسطة");

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">أنشئ قصة خاصة</h1>
        <p className="text-rawaa-grayDark text-sm">صمم قصة ذكاء اصطناعي بلمسة من إبداعك الخاص</p>
      </div>

      <div className="grid md:grid-cols-[1fr_1fr] gap-8">
        <div className="bg-white rounded-xl2 border border-rawaa-gray/60 p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5 bg-rawaa-gold/10 text-rawaa-gold text-sm font-semibold rounded-xl px-4 py-2.5">
            🚧 هذه الميزة قيد التطوير وستُفعَّل في مرحلة قادمة
          </div>

          <fieldset disabled className="opacity-60">
            <Field label="الفئة العمرية">
              <Select value={age} onChange={(e) => setAge(e.target.value)}>
                <option>4-6 سنوات</option>
                <option>6-9 سنوات</option>
                <option>9-12 سنوات</option>
              </Select>
            </Field>
            <Field label="القيمة الأخلاقية">
              <Select value={moral} onChange={(e) => setMoral(e.target.value)}>
                {MORAL_VALUES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="مكان الأحداث">
              <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
                {THEMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="طول القصة">
              <Select value={length} onChange={(e) => setLength(e.target.value)}>
                <option>قصيرة</option>
                <option>متوسطة</option>
                <option>طويلة</option>
              </Select>
            </Field>
            <Field label="فكرة إضافية (اختياري)">
              <Input placeholder="مثال: قصة عن مزارع نخيل يساعد جيرانه..." />
            </Field>
          </fieldset>

          <Button disabled>ابدأ التوليد (قريباً)</Button>
        </div>

        <div className="bg-rawaa-gray/40 rounded-xl2 border border-dashed border-rawaa-grayDark/30 p-6 flex flex-col items-center justify-center text-center text-rawaa-grayDark">
          <div className="text-5xl mb-4">🪄</div>
          <p className="max-w-xs text-sm">
            سيقوم محرك الذكاء الاصطناعي بتوليد قصة عربية مطابقة لقواعد الالتزام الثقافي، ثم
            تمر بالمراجعة الآلية والبشرية قبل نشرها في مكتبتك الخاصة.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
