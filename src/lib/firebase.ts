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

/**
 * Fetch all drawings from Firestore, sorted by date/createdAt descending
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
    
    return drawings;
  } catch (error) {
    console.error("Error fetching drawings: ", error);
    throw error;
  }
}

/**
 * Create a new drawing in Firestore
 */
export async function createDrawing(drawing: Omit<Drawing, "id" | "createdAt" | "likes">): Promise<string> {
  try {
    const drawingsCol = collection(db, "drawings");
    const docRef = await addDoc(drawingsCol, {
      ...drawing,
      createdAt: Date.now(),
      likes: 0
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating drawing: ", error);
    throw error;
  }
}

/**
 * Update an existing drawing in Firestore
 */
export async function updateDrawing(id: string, drawing: Partial<Omit<Drawing, "id">>): Promise<void> {
  try {
    const docRef = doc(db, "drawings", id);
    await updateDoc(docRef, drawing);
  } catch (error) {
    console.error("Error updating drawing: ", error);
    throw error;
  }
}

/**
 * Delete a drawing from Firestore
 */
export async function deleteDrawing(id: string): Promise<void> {
  try {
    const docRef = doc(db, "drawings", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting drawing: ", error);
    throw error;
  }
}

/**
 * Like a drawing (increment likes)
 */
export async function likeDrawing(id: string): Promise<void> {
  try {
    const docRef = doc(db, "drawings", id);
    await updateDoc(docRef, {
      likes: increment(1)
    });
  } catch (error) {
    console.error("Error liking drawing: ", error);
    throw error;
  }
}

/**
 * Fetch comments for a drawing
 */
export async function getComments(drawingId: string): Promise<Comment[]> {
  try {
    const commentsCol = collection(db, "drawings", drawingId, "comments");
    const q = query(commentsCol, orderBy("createdAt", "asc")); // Oldest first
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
    
    return comments;
  } catch (error) {
    console.error("Error fetching comments: ", error);
    throw error;
  }
}

/**
 * Add a comment to a drawing
 */
export async function addComment(drawingId: string, authorName: string, text: string): Promise<string> {
  try {
    const commentsCol = collection(db, "drawings", drawingId, "comments");
    const docRef = await addDoc(commentsCol, {
      authorName,
      text,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding comment: ", error);
    throw error;
  }
}

/**
 * Delete a comment (Admin only)
 */
export async function deleteComment(drawingId: string, commentId: string): Promise<void> {
  try {
    const docRef = doc(db, "drawings", drawingId, "comments", commentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting comment: ", error);
    throw error;
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
      return docSnap.data().imageUrl as string;
    }
    return null;
  } catch (error) {
    console.error("Error fetching hero image: ", error);
    return null;
  }
}

/**
 * Save hero image URL to settings collection
 */
export async function saveHeroImage(imageUrl: string): Promise<void> {
  try {
    const docRef = doc(db, "settings", "hero");
    await setDoc(docRef, { imageUrl }, { merge: true });
  } catch (error) {
    console.error("Error saving hero image: ", error);
    throw error;
  }
}
