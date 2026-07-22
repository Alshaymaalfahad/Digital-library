import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function AdminShell({ children }) {
  const { state, actions } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-medad-gray50 font-arabic">
      <header className="sticky top-0 z-30 bg-white border-b border-medad-gray200">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-arabic font-bold text-2xl text-rawaa-red">رواة</span>
            <span className="text-medad-gray300">|</span>
            <span className="text-sm font-semibold text-medad-900">لوحة تحكم الأدمن</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-medad-gray500">{state.guardian?.name || state.userEmail}</span>
            <button
              onClick={async () => {
                await actions.logout();
                navigate("/");
              }}
              className="text-xs bg-medad-gray100 hover:bg-medad-gray200 text-medad-gray700 rounded-full px-3 py-1.5 transition"
            >
              خروج
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
