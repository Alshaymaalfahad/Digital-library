// Placeholder characters a child can pick when their profile is created.
// Each one is just an emoji + name for now — real illustrated character art
// goes here later. To swap one in: add `image: "/images/characters/xxx.png"`
// to the entry below; CharacterAvatar (see components/CharacterAvatar.jsx)
// already prefers `image` over the emoji fallback automatically.
export const CHARACTERS = [
  { id: "faris", name: "فارس", emoji: "🧒", image: "/images/characters/faris.png" },
  { id: "salma", name: "سلمى", emoji: "👧", image: "/images/characters/salma.png" },
  { id: "sultan", name: "سلطان", emoji: "🧑‍🚀", image: "/images/characters/sultan.png" },
  { id: "noura", name: "نورة", emoji: "🦸‍♀️", image: "/images/characters/noura.png" },
];

export function getCharacter(characterId) {
  return CHARACTERS.find((c) => c.id === characterId) || null;
}
