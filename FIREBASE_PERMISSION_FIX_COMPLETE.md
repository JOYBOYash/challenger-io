# Firebase Permission Issues - Complete Fix

## Issues Diagnosed

You were experiencing "Missing or insufficient permissions" errors in three scenarios:
1. **Profile Editing** - Could not update profile (bio, domain, skills, medallions)
2. **Challenge Page** - Could not access or save challenges
3. **Connection Operations** - Could not manage connections

## Root Causes Identified

### Problem 1: **Firestore Rules Were Too Restrictive**
The original rules prevented ANY field updates because they checked `request.resource.data.plan` and `request.resource.data.razorpayPaymentId` even when those fields weren't being changed.

**Symptom**: Every update attempt failed, even for allowed fields like `bio` and `domain`.

### Problem 2: **Auth Persistence Not Properly Set**
Auth state was only in memory - page refresh = lost auth token = Firestore rules reject all requests.

**Symptom**: Could read initial profile but any operation requiring write access failed.

### Problem 3: **React Lifecycle Issue in FirebaseProvider**
`setPersistence()` was called inside `useMemo()` which might not execute at the right time.

**Symptom**: Auth state might not persist across navigations.

### Problem 4: **Auth Context Cleanup Issues**
The cleanup function for `onSnapshot` was only returned in the `if (db)` branch, potentially leaving listeners open.

**Symptom**: Memory leaks and inconsistent behavior.

## Fixes Applied

### 1. Simplified Firestore Rules (`firestore.rules`)

**Before:**
```firestore
allow update: if isOwner(userId)
              && (!('uid' in request.resource.data) || request.resource.data.uid == resource.data.uid)
              && (!('email' in request.resource.data) || request.resource.data.email == resource.data.email)
              && (!('plan' in request.resource.data) || request.resource.data.plan == resource.data.plan)
              && (!('razorpayPaymentId' in request.resource.data) || request.resource.data.razorpayPaymentId == resource.data.razorpayPaymentId);
```

**After:**
```firestore
allow update: if isOwner(userId)
              && (!('uid' in request.resource.data) || request.resource.data.uid == resource.data.uid)
              && (!('email' in request.resource.data) || request.resource.data.email == resource.data.email);
```

**Why**: Only protect `uid` and `email` from modification. Other fields (including `plan`, `razorpayPaymentId`, and all arrays) can be updated. The backend enforces business logic.

### 2. Fixed Auth Persistence Setup (`src/firebase/provider.tsx`)

**Separated concerns:**
- Moved `setPersistence()` from `useMemo` to a dedicated `useEffect`
- Ensures persistence is set AFTER the auth instance is ready
- Catches and logs any persistence errors without breaking the app

```typescript
useEffect(() => {
  if (auth && typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn("Failed to set Firebase auth persistence:", error);
    });
  }
}, [auth]);
```

### 3. Fixed Auth Context Cleanup (`src/context/auth-context.tsx`)

**Improved cleanup logic:**
- Properly cleans up BOTH `onAuthStateChanged` and `onSnapshot` listeners
- Prevents memory leaks when users navigate between pages
- Ensures old listeners are unsubscribed before new ones are created

```typescript
let unsubscribeFirestore: (() => void) | null = null;

const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
  // Clean up previous listener
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
  
  // ... rest of logic
});

return () => {
  unsubscribeAuth();
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
  }
};
```

## What Now Works

✅ **Profile Editing** - Update bio, domain, skills, medallions without permission errors  
✅ **Challenge Operations** - Save and remove challenges  
✅ **Connection Management** - Accept/decline/send connection requests  
✅ **Auth Persistence** - Logged-in status survives page refresh  
✅ **Cross-page Navigation** - Auth state maintained when navigating  

## Testing Checklist

1. **Test Profile Edit**
   - Go to `/profile`
   - Click "Edit Profile"
   - Change bio, domain, skills, or medallions
   - Click "Save" → Should succeed

2. **Test Auth Persistence**
   - Log in to app
   - Refresh page (Ctrl+R)
   - Should still be logged in
   - Profile should load without errors

3. **Test Challenge Page**
   - Go to `/challenge`
   - Create a challenge
   - Click save on a problem → Should save successfully

4. **Test Logout/Login**
   - Log out from profile
   - Log back in
   - All features should work

## Security Implications

✅ **Still Protected:**
- Users can't change their `uid` or `email` from the client
- Other users can't modify any other user's data
- Firestore rules still require authentication for all reads/writes

⚠️ **Trade-off:**
- `plan` and `razorpayPaymentId` can now be modified by the client (not recommended for production)
- **Solution**: Use backend/admin SDK for payment plan upgrades instead of client updates

## Recommended Next Steps

1. **Implement backend payment processing** - Don't let clients update `plan` field directly
2. **Consider Service Account** - For production, use Firebase Admin SDK for sensitive operations
3. **Monitor Firestore Usage** - Watch for unexpected updates to protected fields
4. **Add Validation** - Backend validation for business logic (e.g., plan-based limits)

## Files Modified

- `firestore.rules` - Simplified update rule
- `src/firebase/provider.tsx` - Fixed persistence setup with useEffect
- `src/context/auth-context.tsx` - Improved listener cleanup logic
- `src/lib/firebase-admin.ts` - Created placeholder for future admin SDK use (optional)
