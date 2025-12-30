# Firebase Authentication Persistence Fix

## Problem Identified

Your Firebase authentication was **not persisting** across page refreshes or navigation. This caused the Firestore rules to deny access because:

1. **User logged in** → Auth state stored in memory
2. **Page refresh** → Auth state lost
3. **Firestore rules check** `request.auth != null` → **Failed** (no auth context)
4. **Permission denied** → "Missing or insufficient permissions" error

## Root Cause

Firebase Auth in Next.js **defaults to `NONE` persistence**, which means:
- Auth state is only kept in memory during the current session
- Any page refresh, navigation, or window reload clears the auth context
- The Firestore rules can't verify the user's identity

## Solution Implemented

### 1. **Enable Browser Local Storage Persistence** (`src/firebase/provider.tsx`)

Added `setPersistence()` to the Firebase initialization:

```typescript
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// Inside FirebaseProvider
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Failed to set Firebase auth persistence:", error);
});
```

**What this does:**
- Stores authentication token in browser's `localStorage`
- Automatically restores auth state on page reload
- Persists until user explicitly signs out

### 2. **Apply Persistence to Server Initialization** (`src/lib/firebase.ts`)

Also added persistence to the `initializeFirebase()` function for consistency:

```typescript
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn("Failed to set Firebase auth persistence:", error);
    });
}
```

**Why both locations:**
- `provider.tsx`: Client-side initialization (React context)
- `lib/firebase.ts`: Server action initialization (form submissions, data operations)

## How It Works Now

1. **User logs in** 
   ```
   → signInWithEmailAndPassword() called
   → Token stored in localStorage (via setPersistence)
   → Auth context updated
   ```

2. **Page refresh or navigate**
   ```
   → Firebase automatically restores auth from localStorage
   → onAuthStateChanged() fires with restored user
   → Firestore rules validate auth successfully
   → User data loads without permission errors
   ```

3. **User logs out**
   ```
   → signOut() called
   → localStorage auth token cleared
   → Auth state set to null
   ```

## Affected Operations

This fix enables persistent access to:

✅ **Login → Profile page** (auth state maintained across pages)  
✅ **Profile edit** (Firestore updates work with persistent auth)  
✅ **Challenge page** (can fetch user data without re-authentication)  
✅ **Connections** (read/write operations maintain auth context)  
✅ **Page refreshes** (user stays logged in)  

## Testing the Fix

1. **Login** at `/login`
2. **Navigate** to `/profile` → Should load without permissions error
3. **Refresh page** → Should still be logged in
4. **Edit profile** → Should save successfully
5. **Go to challenge** → Should load challenges without errors
6. **Close browser/reopen** → Session persists (browser localStorage)

## Browser Compatibility

`browserLocalPersistence` works in:
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers
- ❌ Private/Incognito mode (localStorage disabled - falls back to session)

## Security Notes

- **localStorage access**: Accessible to JavaScript on the same domain
- **Token expiration**: Firebase handles automatic token refresh
- **Logout required**: Auth persists until user calls `signOut()`
- **No sensitive data in localStorage**: Only the auth token (JWT), not passwords

## Verification Checklist

After deploying these changes:
- [ ] Users can log in
- [ ] Auth persists after page refresh
- [ ] Profile can be edited without permission errors
- [ ] Challenge page loads successfully
- [ ] Logout clears the session
- [ ] Firestore reads/writes work smoothly

If issues persist, check:
1. Browser dev tools → Application/Storage → localStorage (should have Firebase tokens)
2. Browser console for any `setPersistence` warnings
3. Firestore rules still allow authenticated reads/writes
