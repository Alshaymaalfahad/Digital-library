import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import CharacterAvatar from "../components/CharacterAvatar";
import { markChildPicked } from "../utils/childPickerSession";

export default function ChildPicker() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [pinChild, setPinChild] = useState(null);

  function enter(childId) {
    actions.setActiveChild(childId);
    markChildPicked();
    navigate("/home");
  }

  function pick(child) {
    // Children created before the PIN feature (or if it wasn't set) have no
    // PIN on file — don't lock the guardian out, just enter directly.
    if (!child.pin) return enter(child.id);
    setPinChild(child);
  }

  if (state.loading.children && state.children.length === 0) {
    return (
      <div className="min-h-screen bg-rawaa-cream flex items-center justify-center text-rawaa-grayDark text-sm" dir="rtl">
        جارِ تحميل ملفات الأطفال...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rawaa-cream flex flex-col items-center justify-center px-6 py-12" dir="rtl">
      <span className="font-arabic font-bold text-3xl text-rawaa-red mb-10">رواة</span>

      <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 text-center">من سيقرأ اليوم؟</h1>
      <p className="text-rawaa-grayDark text-sm mb-10 text-center"></p>

      <div className="flex flex-wrap items-center justify-center gap-5 max-w-3xl">
        {state.children.map((child) => (
          <button
            key={child.id}
            onClick={() => pick(child)}
            className="w-40 bg-white rounded-xl2 border border-rawaa-gray/60 shadow-card p-5 flex flex-col items-center gap-3 hover:border-rawaa-red hover:shadow-lg transition"
          >
            <CharacterAvatar characterId={child.characterId} gender={child.gender} size="lg" />
            <span className="font-display font-bold text-sm">{child.name}</span>
          </button>
        ))}

        <Link
          to="/onboarding/child"
          className="w-40 rounded-xl2 border-2 border-dashed border-rawaa-gray p-5 flex flex-col items-center justify-center gap-2 text-rawaa-grayDark hover:border-rawaa-red hover:text-rawaa-red transition min-h-[148px]"
        >
          <span className="w-9 h-9 rounded-full bg-rawaa-redTint text-rawaa-red flex items-center justify-center text-xl">
            +
          </span>
          <span className="text-xs font-semibold">إضافة طفل</span>
        </Link>
      </div>

      {pinChild && (
        <PinModal child={pinChild} onClose={() => setPinChild(null)} onSuccess={() => enter(pinChild.id)} />
      )}
    </div>
  );
}

function PinModal({ child, onClose, onSuccess }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (value === child.pin) {
      onSuccess();
    } else {
      setError("الرمز غير صحيح، حاول مرة أخرى.");
      setValue("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl2 shadow-2xl p-6 w-full max-w-xs text-center">
        <CharacterAvatar characterId={child.characterId} gender={child.gender} size="lg" className="mx-auto mb-3" />
        <h2 className="font-display font-bold text-lg mb-1">{child.name}</h2>
        <p className="text-xs text-rawaa-grayDark mb-5">أدخل رمزك الشخصي المكوّن من ٤ أرقام</p>

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={value}
            onChange={(e) => {
              setError("");
              setValue(e.target.value.replace(/\D/g, "").slice(0, 4));
            }}
            className="w-full text-center tracking-[0.6em] text-xl rounded-xl border border-rawaa-gray px-4 py-3 focus:border-rawaa-red focus:ring-1 focus:ring-rawaa-red outline-none mb-3"
            placeholder="••••"
          />
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={value.length !== 4}
            className="w-full bg-rawaa-red text-white font-semibold rounded-xl py-2.5 mb-2 disabled:opacity-40"
          >
            دخول
          </button>
          <button type="button" onClick={onClose} className="w-full text-sm text-rawaa-grayDark py-1.5">
            إلغاء
          </button>
        </form>
      </div>
    </div>
  );
}
