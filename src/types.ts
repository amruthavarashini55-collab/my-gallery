export interface Drawing {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string; // Base64 data URL or external image URL
  createdAt: number;
  likes?: number;
}

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
}
