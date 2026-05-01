const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const FIREBASE_AUTH_BASE = "https://identitytoolkit.googleapis.com/v1";
const FIREBASE_SECURE_TOKEN_URL = "https://securetoken.googleapis.com/v1/token";

export type FirebaseAuthUser = {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  displayName?: string;
};

function requireApiKey() {
  if (!FIREBASE_API_KEY) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY가 설정되지 않았어요.");
  return FIREBASE_API_KEY;
}

function requireProjectId() {
  if (!FIREBASE_PROJECT_ID) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID가 설정되지 않았어요.");
  return FIREBASE_PROJECT_ID;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const code = data?.error?.message ?? "UNKNOWN";
    throw new Error(code);
  }
  return data as T;
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<FirebaseAuthUser> {
  const key = requireApiKey();
  const signup = await postJSON<{ localId: string; email: string; idToken: string; refreshToken: string }>(
    `${FIREBASE_AUTH_BASE}/accounts:signUp?key=${key}`,
    { email, password, returnSecureToken: true }
  );
  await postJSON(`${FIREBASE_AUTH_BASE}/accounts:update?key=${key}`, {
    idToken: signup.idToken,
    displayName,
    returnSecureToken: true,
  });
  return { ...signup, displayName };
}

export async function loginWithEmail(email: string, password: string): Promise<FirebaseAuthUser> {
  const key = requireApiKey();
  const data = await postJSON<{ localId: string; email: string; idToken: string; refreshToken: string; displayName?: string }>(
    `${FIREBASE_AUTH_BASE}/accounts:signInWithPassword?key=${key}`,
    { email, password, returnSecureToken: true }
  );
  return data;
}

export async function loginWithGoogleIdToken(idToken: string): Promise<FirebaseAuthUser> {
  const key = requireApiKey();
  const data = await postJSON<{ localId: string; email: string; idToken: string; refreshToken: string; displayName?: string }>(
    `${FIREBASE_AUTH_BASE}/accounts:signInWithIdp?key=${key}`,
    {
      postBody: `id_token=${idToken}&providerId=google.com`,
      requestUri: window.location.origin,
      returnIdpCredential: true,
      returnSecureToken: true,
    }
  );
  return data;
}

export async function saveUserProfile(uid: string, idToken: string, profile: { email: string; name: string }) {
  const projectId = requireProjectId();
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
  await fetch(`${url}?updateMask.fieldPaths=email&updateMask.fieldPaths=name`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        email: { stringValue: profile.email },
        name: { stringValue: profile.name },
      },
    }),
  });
}

export async function refreshIdToken(refreshToken: string) {
  const key = requireApiKey();
  const res = await fetch(`${FIREBASE_SECURE_TOKEN_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "TOKEN_REFRESH_FAILED");
  return data as { id_token: string; refresh_token: string; user_id: string };
}
