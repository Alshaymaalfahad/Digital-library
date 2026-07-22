import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, Input, Button } from "../components/Field";
import CharacterAvatar from "../components/CharacterAvatar";
import { useApp } from "../context/AppContext";
import { CHARACTERS } from "../data/characters";
import { markChildPicked } from "../utils/childPickerSession";

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
  const [characterId, setCharacterId] = useState(CHARACTERS[0].id);
  const [pin, setPin] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleInterest(i) {
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!/^\d{4}$/.test(pin)) {
      setError("الرمز الشخصي يجب أن يتكوّن من ٤ أرقام بالضبط.");
      return;
    }
    setSubmitting(true);
    try {
      await actions.addChild({ name, age, gender, readingLevel: level, interests, characterId, pin });
      markChildPicked();
      navigate("/home");
    } catch (err) {
      setError(err.message || "تعذر إضافة الطفل، حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-rawaa-red flex items-center justify-center px-4 py-10" dir="rtl">
      <div className="w-full max-w-lg bg-white rounded-xl2 shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto">
        <div className="text-center mb-6">
          <span className="font-arabic font-bold text-2xl text-rawaa-red block mb-4">رواة</span>
          <h1 className="font-display text-xl font-bold mb-1">إضافة طفل</h1>
          <p className="text-sm text-rawaa-grayDark">أهلاً بروّاد رواة الصغار!</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="اسم الطفل">
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الطفل أو كنيته" />
          </Field>

          <Field label="اختر شخصية طفلك">
            <div className="grid grid-cols-2 gap-2.5">
              {CHARACTERS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCharacterId(c.id)}
                  aria-label={c.name}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition ${
                    characterId === c.id ? "border-rawaa-red bg-rawaa-redTint" : "border-rawaa-gray"
                  }`}
                >
                  <CharacterAvatar characterId={c.id} size="lg" />
                </button>
              ))}
            </div>
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

          <Field label="رمز شخصي (٤ أرقام)">
            <Input
              required
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="tracking-[0.5em] text-center"
            />
          </Field>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <Button type="submit" className="mt-2" disabled={submitting}>
            {submitting ? "جارِ الحفظ..." : "إنهاء الإعداد ودخول المكتبة ←"}
          </Button>
        </form>
      </div>
    </div>
  );
}
