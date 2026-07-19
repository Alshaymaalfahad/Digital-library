import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Field, Input, Button } from "../components/Field";
import { useApp } from "../context/AppContext";

const INTERESTS = ["الاعتماد", "الفضول", "الحيوانات", "العلوم", "التاريخ", "المغامرات"];
const LEVELS = [
  { id: "beginner", label: "مبتدئ" },
  { id: "intermediate", label: "متوسط" },
  { id: "advanced", label: "متمكن" },
];

export default function AddChild() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("boy");
  const [level, setLevel] = useState("beginner");
  const [interests, setInterests] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleInterest(i) {
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await actions.addChild({ name, age, gender, readingLevel: level, interests });
      navigate("/");
    } catch (err) {
      setError(err.message || "تعذر إضافة الطفل، حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="رحلة معرفة خاصة بطفلك"
      subtitle="أضف بيانات بسيطة عن طفلك حتى نرشّح له القصص المناسبة"
    >
      <h1 className="text-2xl font-bold mb-1">إضافة أول طفل</h1>
      <p className="text-sm text-rawaa-grayDark mb-6">أهلاً بروّاد رُواء الصغار!</p>

      <form onSubmit={handleSubmit}>
        <Field label="اسم الطفل">
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الطفل أو كنيته" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="العمر">
            <Input required type="number" min={4} max={12} value={age} onChange={(e) => setAge(e.target.value)} placeholder="4-12" />
          </Field>
          <Field label="الجنس">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender("boy")}
                className={`flex-1 rounded-xl border py-2.5 text-sm ${gender === "boy" ? "border-rawaa-red bg-rawaa-redTint text-rawaa-red" : "border-rawaa-gray"}`}
              >
                ولد
              </button>
              <button
                type="button"
                onClick={() => setGender("girl")}
                className={`flex-1 rounded-xl border py-2.5 text-sm ${gender === "girl" ? "border-rawaa-red bg-rawaa-redTint text-rawaa-red" : "border-rawaa-gray"}`}
              >
                بنت
              </button>
            </div>
          </Field>
        </div>

        <Field label="مستوى القراءة">
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button
                type="button"
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex-1 rounded-xl border py-2.5 text-sm ${level === l.id ? "border-rawaa-red bg-rawaa-redTint text-rawaa-red" : "border-rawaa-gray"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="الاهتمامات المفضلة">
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => toggleInterest(i)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  interests.includes(i) ? "border-rawaa-red bg-rawaa-redTint text-rawaa-red" : "border-rawaa-gray text-rawaa-grayDark"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </Field>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <Button type="submit" className="mt-2" disabled={submitting}>
          {submitting ? "جارِ الحفظ..." : "إنهاء الإعداد ودخول المكتبة ←"}
        </Button>
      </form>
    </AuthLayout>
  );
}
