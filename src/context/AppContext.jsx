import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const AppContext = createContext(null);

function shapeStories(storyRows, pageRows) {
  const pagesByStory = {};
  for (const p of pageRows) {
    if (!pagesByStory[p.story_id]) pagesByStory[p.story_id] = [];
    pagesByStory[p.story_id].push({
      pageNumber: p.page_number,
      text: p.text,
      imagePrompt: p.image_prompt,
      imageUrl: p.image_url,
      audioUrl: p.audio_url,
    });
  }
  return storyRows
    .map((s) => ({
      id: s.id,
      title: s.title,
      type: s.type,
      ageRange: s.age_range,
      moral: s.moral,
      cover: { imagePrompt: s.cover_image_prompt, imageUrl: s.cover_image_url },
      backCover: { imagePrompt: s.back_image_prompt, imageUrl: s.back_image_url },
      createdAt: s.created_at,
      pages: (pagesByStory[s.id] || []).sort((a, b) => a.pageNumber - b.pageNumber),
    }))
    .sort((a, b) => a.id - b.id);
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [guardian, setGuardian] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [activeChildId, setActiveChildIdState] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState({ children: false, favorites: false, stories: false });

  // --- auth session bootstrap -------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user || null;
  const isAuthenticated = !!user;
  const emailVerified = !!(user?.email_confirmed_at || user?.confirmed_at);

  // --- profile (guardian) ------------------------------------------------------
  const refreshProfile = useCallback(async () => {
    if (!user) return setGuardian(null);
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setGuardian(
      data
        ? {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            language: data.language,
            region: data.region,
            notifications: data.notifications,
            isAdmin: data.is_admin || false,
          }
        : null
    );
  }, [user]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // --- children ------------------------------------------------------------
  const refreshChildren = useCallback(async () => {
    if (!user) return setChildrenList([]);
    setLoading((l) => ({ ...l, children: true }));
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("guardian_id", user.id)
      .order("created_at", { ascending: true });
    setLoading((l) => ({ ...l, children: false }));
    if (error) return console.error(error);
    const mapped = (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      age: c.age,
      gender: c.gender,
      readingLevel: c.reading_level,
      interests: c.interests || [],
      dailyScreenTimeMinutes: c.daily_screen_time_minutes,
    }));
    setChildrenList(mapped);
    setActiveChildIdState((cur) => cur || mapped[0]?.id || null);
  }, [user]);

  useEffect(() => {
    refreshChildren();
  }, [refreshChildren]);

  // --- stories library (fetched once per session) ---------------------------
  useEffect(() => {
    if (!user) return;
    setLoading((l) => ({ ...l, stories: true }));
    Promise.all([supabase.from("stories").select("*"), supabase.from("story_pages").select("*")]).then(
      ([storiesRes, pagesRes]) => {
        setLoading((l) => ({ ...l, stories: false }));
        if (storiesRes.error) return console.error(storiesRes.error);
        if (pagesRes.error) return console.error(pagesRes.error);
        setStories(shapeStories(storiesRes.data || [], pagesRes.data || []));
      }
    );
  }, [user]);

  // --- favorites + reading progress for the active child ---------------------
  const refreshChildData = useCallback(async () => {
    if (!activeChildId) {
      setFavorites([]);
      setReadingHistory([]);
      return;
    }
    setLoading((l) => ({ ...l, favorites: true }));
    const [favRes, progRes] = await Promise.all([
      supabase.from("favorites").select("story_id").eq("child_id", activeChildId),
      supabase
        .from("reading_progress")
        .select("story_id,last_page,updated_at,time_spent_seconds,rating")
        .eq("child_id", activeChildId),
    ]);
    setLoading((l) => ({ ...l, favorites: false }));
    if (!favRes.error) setFavorites((favRes.data || []).map((f) => f.story_id));
    if (!progRes.error)
      setReadingHistory(
        (progRes.data || []).map((p) => ({
          storyId: p.story_id,
          lastPage: p.last_page,
          updatedAt: p.updated_at,
          timeSpentSeconds: p.time_spent_seconds || 0,
          rating: p.rating || null,
        }))
      );
  }, [activeChildId]);

  useEffect(() => {
    refreshChildData();
  }, [refreshChildData]);

  const actions = {
    async register({ name, email, password }) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
    },

    async confirmEmailOtp(email, token) {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
      if (error) throw error;
    },

    async resendVerification(email) {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
    },

    async login(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },

    async logout() {
      await supabase.auth.signOut();
      setGuardian(null);
      setChildrenList([]);
      setActiveChildIdState(null);
      setFavorites([]);
      setReadingHistory([]);
    },

    async updateGuardian(patch) {
      if (!user) return;
      const dbPatch = {};
      if ("name" in patch) dbPatch.name = patch.name;
      if ("phone" in patch) dbPatch.phone = patch.phone;
      if ("language" in patch) dbPatch.language = patch.language;
      if ("region" in patch) dbPatch.region = patch.region;
      if ("notifications" in patch) dbPatch.notifications = patch.notifications;
      const { error } = await supabase.from("profiles").update(dbPatch).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
    },

    async addChild(child) {
      if (!user) return;
      const { data, error } = await supabase
        .from("children")
        .insert({
          guardian_id: user.id,
          name: child.name,
          age: child.age ? Number(child.age) : null,
          gender: child.gender,
          reading_level: child.readingLevel,
          interests: child.interests || [],
        })
        .select()
        .single();
      if (error) throw error;
      await refreshChildren();
      setActiveChildIdState(data.id);
      return data.id;
    },

    setActiveChild(id) {
      setActiveChildIdState(id);
    },

    async toggleFavorite(storyId) {
      if (!activeChildId) return;
      const has = favorites.includes(storyId);
      if (has) {
        await supabase.from("favorites").delete().eq("child_id", activeChildId).eq("story_id", storyId);
      } else {
        await supabase.from("favorites").insert({ child_id: activeChildId, story_id: storyId });
      }
      await refreshChildData();
    },

    async updateReadingProgress(storyId, lastPage) {
      if (!activeChildId) return;
      await supabase
        .from("reading_progress")
        .upsert(
          { child_id: activeChildId, story_id: storyId, last_page: lastPage, updated_at: new Date().toISOString() },
          { onConflict: "child_id,story_id" }
        );
      // optimistic local update to avoid a round trip on every page turn
      setReadingHistory((h) => {
        const exists = h.find((x) => x.storyId === storyId);
        const entry = {
          storyId,
          lastPage,
          updatedAt: new Date().toISOString(),
          timeSpentSeconds: exists?.timeSpentSeconds || 0,
          rating: exists?.rating || null,
        };
        return exists ? h.map((x) => (x.storyId === storyId ? entry : x)) : [...h, entry];
      });
    },

    async rateStory(storyId, rating) {
      if (!activeChildId) return;
      const existing = readingHistory.find((h) => h.storyId === storyId);
      await supabase
        .from("reading_progress")
        .upsert(
          {
            child_id: activeChildId,
            story_id: storyId,
            rating,
            last_page: existing?.lastPage || 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "child_id,story_id" }
        );
      setReadingHistory((h) => {
        const entry = { storyId, lastPage: existing?.lastPage || 0, updatedAt: new Date().toISOString(), timeSpentSeconds: existing?.timeSpentSeconds || 0, rating };
        return existing ? h.map((x) => (x.storyId === storyId ? { ...x, rating } : x)) : [...h, entry];
      });
    },

    async addReadingTime(storyId, secondsDelta) {
      if (!activeChildId) return;
      const existing = readingHistory.find((h) => h.storyId === storyId);
      const newTotal = (existing?.timeSpentSeconds || 0) + secondsDelta;
      await supabase
        .from("reading_progress")
        .upsert(
          {
            child_id: activeChildId,
            story_id: storyId,
            last_page: existing?.lastPage || 0,
            time_spent_seconds: newTotal,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "child_id,story_id" }
        );
      setReadingHistory((h) => {
        const entry = { storyId, lastPage: existing?.lastPage || 0, updatedAt: new Date().toISOString(), timeSpentSeconds: newTotal };
        return existing ? h.map((x) => (x.storyId === storyId ? { ...x, timeSpentSeconds: newTotal } : x)) : [...h, entry];
      });
    },

    async updateChildSettings(childId, patch) {
      const dbPatch = {};
      if ("dailyScreenTimeMinutes" in patch) dbPatch.daily_screen_time_minutes = patch.dailyScreenTimeMinutes;
      const { error } = await supabase.from("children").update(dbPatch).eq("id", childId);
      if (error) throw error;
      await refreshChildren();
    },
  };

  const state = {
    authReady,
    isAuthenticated,
    emailVerified,
    guardian,
    children: childrenList,
    activeChildId,
    favorites,
    readingHistory,
    stories,
    loading,
    userEmail: user?.email || guardian?.email || null,
  };

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
