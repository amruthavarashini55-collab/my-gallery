import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  query, 
  orderBy,
  increment
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User
} from "firebase/auth";
import { Drawing, Comment } from "../types";

// Firebase credentials from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyDPMqLfnE8OuzrjHj7H2IL3FOxHw4hpl6o",
  authDomain: "principal-metric-kxctm.firebaseapp.com",
  projectId: "principal-metric-kxctm",
  storageBucket: "principal-metric-kxctm.firebasestorage.app",
  messagingSenderId: "307500259331",
  appId: "1:307500259331:web:db43de1ed104dee1dc5636"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID
export const db = getFirestore(app, "ai-studio-drawinggallery-6d6acc9b-e94f-4ac7-a21e-a72c2ac6c1d6");

// Initialize Auth
export const auth = getAuth(app);

// Target Admin Email
export const ADMIN_EMAIL = "amrutha.varashini55@gmail.com";

/**
 * Checks if a user is the authorized admin.
 */
export function isUserAdmin(user: User | null): boolean {
  if (localStorage.getItem("local_admin_session") === "true") {
    return true;
  }
  return user !== null && user.email === ADMIN_EMAIL;
}

/**
 * Helper to compress a Base64 image to prevent Firestore 1MB limits and keep loading fast
 */
export function compressImage(base64Str: string, maxW = 1000, maxH = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's not a data URL or is very short, return it as is
    if (!base64Str.startsWith("data:image")) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
      } else {
        if (height > maxH) {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Export as compressed JPEG
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}

const DEFAULT_DRAWINGS: Drawing[] = [
  {
    id: "sample-1",
    title: "Botanical Study in Graphite",
    description: "Detailed study of monstera leaves and delicate flora shadows.",
    date: "2026-05-12",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    createdAt: Date.now() - 86400000 * 3,
    likes: 14
  },
  {
    id: "sample-2",
    title: "Urban Alleyway Inkwork",
    description: "Crosshatch and fine liner sketch capturing morning light in an old European alley.",
    date: "2026-06-04",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    createdAt: Date.now() - 86400000 * 2,
    likes: 22
  },
  {
    id: "sample-3",
    title: "Serene Portrait Wash",
    description: "Watercolor and charcoal portrait study focusing on soft expressive mood.",
    date: "2026-06-20",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    createdAt: Date.now() - 86400000,
    likes: 31
  }
];

function getLocalDrawings(): Drawing[] {
  try {
    const stored = localStorage.getItem("local_drawings");
    if (!stored) {
      localStorage.setItem("local_drawings", JSON.stringify(DEFAULT_DRAWINGS));
      return DEFAULT_DRAWINGS;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_DRAWINGS;
  }
}

function saveLocalDrawings(drawings: Drawing[]) {
  try {
    localStorage.setItem("local_drawings", JSON.stringify(drawings));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
}

function getLocalComments(drawingId: string): Comment[] {
  try {
    const stored = localStorage.getItem(`local_comments_${drawingId}`);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalComments(drawingId: string, comments: Comment[]) {
  try {
    localStorage.setItem(`local_comments_${drawingId}`, JSON.stringify(comments));
  } catch (e) {
    console.error("Failed to save comments to local storage", e);
  }
}

/**
 * Fetch all drawings from Firestore, with graceful localStorage fallback
 */
export async function getDrawings(): Promise<Drawing[]> {
  try {
    const drawingsCol = collection(db, "drawings");
    const q = query(drawingsCol, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const drawings: Drawing[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      drawings.push({
        id: docSnap.id,
        title: data.title || "Untitled",
        description: data.description || "",
        date: data.date || "",
        imageUrl: data.imageUrl || "",
        createdAt: data.createdAt || Date.now(),
        likes: data.likes || 0
      });
    });
    
    // Cache successfully fetched drawings to local storage
    if (drawings.length > 0) {
      saveLocalDrawings(drawings);
    }
    
    return drawings;
  } catch (error) {
    console.warn("Firestore unreachable, falling back to local storage drawings: ", error);
    return getLocalDrawings();
  }
}

/**
 * Create a new drawing
 */
export async function createDrawing(drawing: Omit<Drawing, "id" | "createdAt" | "likes">): Promise<string> {
  const newDrawing: Drawing = {
    id: "local-" + Date.now(),
    ...drawing,
    createdAt: Date.now(),
    likes: 0
  };

  try {
    const drawingsCol = collection(db, "drawings");
    const docRef = await addDoc(drawingsCol, {
      ...drawing,
      createdAt: newDrawing.createdAt,
      likes: 0
    });
    return docRef.id;
  } catch (error) {
    console.warn("Firestore unreachable for create, saving locally: ", error);
    const current = getLocalDrawings();
    saveLocalDrawings([newDrawing, ...current]);
    return newDrawing.id;
  }
}

/**
 * Update an existing drawing
 */
export async function updateDrawing(id: string, drawing: Partial<Omit<Drawing, "id">>): Promise<void> {
  try {
    if (!id.startsWith("local-")) {
      const docRef = doc(db, "drawings", id);
      await updateDoc(docRef, drawing);
      return;
    }
    throw new Error("Local item update");
  } catch (error) {
    console.warn("Updating drawing locally: ", error);
    const current = getLocalDrawings();
    const updated = current.map(d => d.id === id ? { ...d, ...drawing } : d);
    saveLocalDrawings(updated);
  }
}

/**
 * Delete a drawing
 */
export async function deleteDrawing(id: string): Promise<void> {
  try {
    if (!id.startsWith("local-")) {
      const docRef = doc(db, "drawings", id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.warn("Deleting drawing locally: ", error);
  } finally {
    const current = getLocalDrawings();
    const filtered = current.filter(d => d.id !== id);
    saveLocalDrawings(filtered);
  }
}

/**
 * Like a drawing (increment likes)
 */
export async function likeDrawing(id: string): Promise<void> {
  try {
    if (!id.startsWith("local-")) {
      const docRef = doc(db, "drawings", id);
      await updateDoc(docRef, {
        likes: increment(1)
      });
      return;
    }
    throw new Error("Local item like");
  } catch (error) {
    console.warn("Liking drawing locally: ", error);
    const current = getLocalDrawings();
    const updated = current.map(d => d.id === id ? { ...d, likes: (d.likes || 0) + 1 } : d);
    saveLocalDrawings(updated);
  }
}

/**
 * Fetch comments for a drawing
 */
export async function getComments(drawingId: string): Promise<Comment[]> {
  try {
    const commentsCol = collection(db, "drawings", drawingId, "comments");
    const q = query(commentsCol, orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    
    const comments: Comment[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      comments.push({
        id: docSnap.id,
        authorName: data.authorName || "Anonymous",
        text: data.text || "",
        createdAt: data.createdAt || Date.now()
      });
    });
    
    if (comments.length > 0) {
      saveLocalComments(drawingId, comments);
    }
    
    return comments;
  } catch (error) {
    console.warn("Firestore unreachable for comments, falling back to local: ", error);
    return getLocalComments(drawingId);
  }
}

/**
 * Add a comment to a drawing
 */
export async function addComment(drawingId: string, authorName: string, text: string): Promise<string> {
  const newComment: Comment = {
    id: "comment-local-" + Date.now(),
    authorName,
    text,
    createdAt: Date.now()
  };

  try {
    const commentsCol = collection(db, "drawings", drawingId, "comments");
    const docRef = await addDoc(commentsCol, {
      authorName,
      text,
      createdAt: newComment.createdAt
    });
    return docRef.id;
  } catch (error) {
    console.warn("Firestore unreachable for addComment, saving locally: ", error);
    const current = getLocalComments(drawingId);
    saveLocalComments(drawingId, [...current, newComment]);
    return newComment.id;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(drawingId: string, commentId: string): Promise<void> {
  try {
    if (!commentId.startsWith("comment-local-")) {
      const docRef = doc(db, "drawings", drawingId, "comments", commentId);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.warn("Deleting comment locally: ", error);
  } finally {
    const current = getLocalComments(drawingId);
    const filtered = current.filter(c => c.id !== commentId);
    saveLocalComments(drawingId, filtered);
  }
}

/**
 * Get hero image URL from settings collection
 */
export async function getHeroImage(): Promise<string | null> {
  try {
    const docRef = doc(db, "settings", "hero");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const url = docSnap.data().imageUrl as string;
      localStorage.setItem("local_hero_image", url);
      return url;
    }
    return localStorage.getItem("local_hero_image");
  } catch (error) {
    console.warn("Firestore unreachable for hero image, using local: ", error);
    return localStorage.getItem("local_hero_image");
  }
}

/**
 * Save hero image URL to settings collection
 */
export async function saveHeroImage(imageUrl: string): Promise<void> {
  try {
    localStorage.setItem("local_hero_image", imageUrl);
    const docRef = doc(db, "settings", "hero");
    await setDoc(docRef, { imageUrl }, { merge: true });
  } catch (error) {
    console.warn("Firestore unreachable for saving hero image, saved locally: ", error);
  }
}
