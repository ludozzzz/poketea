import { useState, useEffect } from "react";
import { auth, db, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, doc, getDoc, setDoc, updateDoc, serverTimestamp, googleProvider, signInWithPopup } from "../firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check admin
        try {
          const adminSnap = await getDoc(doc(db, "admins", u.uid));
          setIsAdmin(adminSnap.exists() && adminSnap.data().role === "admin");
        } catch { setIsAdmin(false); }
        // Get profile
        try {
          const profSnap = await getDoc(doc(db, "users", u.uid));
          if (profSnap.exists()) setProfile({ id: u.uid, ...profSnap.data() });
          else setProfile(null);
        } catch { setProfile(null); }
      } else {
        setIsAdmin(false);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, pw) => {
    const cred = await signInWithEmailAndPassword(auth, email, pw);
    return cred.user;
  };

  const register = async (email, pw, data) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    const prof = {
      name: data.name,
      email,
      phone: data.phone || "",
      birthday: data.birthday || "",
      points: 0,
      totalSpent: 0,
      orderCount: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), prof);
    setProfile({ id: cred.user.uid, ...prof });
    return cred.user;
  };

  const logout = () => signOut(auth);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    // Check if profile exists, if not create one
    const profSnap = await getDoc(doc(db, "users", u.uid));
    if (!profSnap.exists()) {
      const prof = {
        name: u.displayName || "Utilisateur",
        email: u.email,
        phone: u.phoneNumber || "",
        birthday: "",
        points: 0,
        totalSpent: 0,
        orderCount: 0,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", u.uid), prof);
      setProfile({ id: u.uid, ...prof });
    }
    return u;
  };

  const addPoints = async (pts, spent) => {
    if (!user || !profile) return;
    const ref = doc(db, "users", user.uid);
    const newProfile = {
      ...profile,
      points: (profile.points || 0) + pts,
      totalSpent: (profile.totalSpent || 0) + spent,
      orderCount: (profile.orderCount || 0) + 1,
    };
    await updateDoc(ref, {
      points: newProfile.points,
      totalSpent: newProfile.totalSpent,
      orderCount: newProfile.orderCount,
    });
    setProfile(newProfile);
  };

  const redeemPoints = async () => {
    if (!user || !profile || profile.points < 100) return false;
    const ref = doc(db, "users", user.uid);
    const newPts = profile.points - 100;
    await updateDoc(ref, { points: newPts });
    setProfile({ ...profile, points: newPts });
    return true;
  };

  return { user, profile, isAdmin, loading, login, loginWithGoogle, register, logout, addPoints, redeemPoints };
}
