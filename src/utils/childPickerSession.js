// "Did the guardian already pick a child this session?" — session-scoped
// (not per-page-load) so refreshing /home or /library doesn't re-ask, but a
// fresh login (after an explicit logout) asks again.
const KEY = "rawaa_child_picked";

export function hasPickedChildThisSession() {
  return sessionStorage.getItem(KEY) === "1";
}

export function markChildPicked() {
  sessionStorage.setItem(KEY, "1");
}

export function clearChildPicked() {
  sessionStorage.removeItem(KEY);
}
