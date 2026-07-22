import { getCharacter } from "../data/characters";

export default function CharacterAvatar({ characterId, gender, size = "md", bg = "bg-rawaa-redTint", className = "" }) {
  const character = getCharacter(characterId);
  const sizes = { sm: "w-9 h-9 text-lg", md: "w-14 h-14 text-2xl", xl: "w-20 h-20 text-3xl", lg: "w-24 h-24 text-5xl" };

  const fallbackEmoji = gender === "girl" ? "👧" : "👦";
  const emoji = character?.emoji || fallbackEmoji;

  return (
    <div
      className={`rounded-full ${bg} flex items-center justify-center shrink-0 overflow-hidden ${sizes[size]} ${className}`}
    >
      {character?.image ? (
        <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
      ) : (
        <span>{emoji}</span>
      )}
    </div>
  );
}
