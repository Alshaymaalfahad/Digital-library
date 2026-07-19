import { useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import StoryCard from "../components/StoryCard";
import { useApp } from "../context/AppContext";
import { AGE_BUCKETS, bucketForAgeRange } from "../utils/ageBuckets";

export default function Library() {
  const { state } = useApp();
  const stories = state.stories;
  const [query, setQuery] = useState("");
  const [ageBucket, setAgeBucket] = useState("الكل");
  const [storyType, setStoryType] = useState("الكل");

  const storyTypes = useMemo(
    () => ["الكل", ...Array.from(new Set(stories.map((s) => s.type).filter(Boolean)))],
    [stories]
  );

  const filtered = useMemo(() => {
    return stories.filter((s) => {
      const matchesQuery =
        !query ||
        s.title.includes(query) ||
        (s.moral || "").includes(query) ||
        (s.type || "").includes(query);
      const matchesType = storyType === "الكل" || s.type === storyType;
      const matchesAge = ageBucket === "الكل" || bucketForAgeRange(s.ageRange)?.id === ageBucket;
      return matchesQuery && matchesType && matchesAge;
    });
  }, [query, ageBucket, storyType, stories]);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">مكتبة القصص</h1>
        <p className="text-rawaa-grayDark text-sm">اكتشف عالماً من القصص المميزة لأطفالك</p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن قصة..."
            className="w-full rounded-full border border-rawaa-gray bg-white px-5 py-2.5 pr-10 text-sm focus:border-rawaa-red focus:ring-1 focus:ring-rawaa-red outline-none"
          />
          <span className="absolute top-1/2 -translate-y-1/2 right-4 text-rawaa-grayDark">🔎</span>
        </div>

        <div>
          <div className="text-xs font-semibold text-rawaa-grayDark mb-1.5">الفئة العمرية</div>
          <div className="flex gap-2 overflow-x-auto">
            <FilterChip active={ageBucket === "الكل"} onClick={() => setAgeBucket("الكل")}>
              الكل
            </FilterChip>
            {AGE_BUCKETS.map((b) => (
              <FilterChip key={b.id} active={ageBucket === b.id} onClick={() => setAgeBucket(b.id)}>
                {b.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-rawaa-grayDark mb-1.5">نوع القصة</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {storyTypes.map((t) => (
              <FilterChip key={t} active={storyType === t} onClick={() => setStoryType(t)}>
                {t}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {state.loading.stories && stories.length === 0 ? (
        <div className="text-center py-20 text-rawaa-grayDark">جارِ تحميل القصص...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-rawaa-grayDark">
          لا توجد قصص مطابقة لبحثك. جرّب كلمة أخرى أو فلتر مختلف.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold border transition ${
        active ? "bg-rawaa-red text-white border-rawaa-red" : "border-rawaa-gray text-rawaa-grayDark"
      }`}
    >
      {children}
    </button>
  );
}
