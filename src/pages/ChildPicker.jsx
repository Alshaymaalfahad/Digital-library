import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import CharacterAvatar from "../components/CharacterAvatar";
import { markChildPicked } from "../utils/childPickerSession";

export default function ChildPicker() {
  const { state, actions } = useApp();
  const navigate = useNavigate();

  function pick(childId) {
    actions.setActiveChild(childId);
    markChildPicked();
    navigate("/home");
  }

  return (
    <div className="min-h-screen bg-rawaa-cream flex flex-col items-center justify-center px-6 py-12" dir="rtl">
      <img src="/images/brand/medad-logo.png" alt="مداد" className="h-9 w-auto mb-10" />

      <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 text-center">من سيقرأ اليوم؟</h1>
      <p className="text-rawaa-grayDark text-sm mb-10 text-center"></p>

      <div className="flex flex-wrap items-center justify-center gap-5 max-w-3xl">
        {state.children.map((child) => (
          <button
            key={child.id}
            onClick={() => pick(child.id)}
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
    </div>
  );
}
