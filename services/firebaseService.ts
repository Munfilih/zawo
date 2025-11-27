import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Video } from "../types";

const COLLECTION_NAME = "supportApp";
const VIDEOS_DOC = "videos";

export const saveVideos = async (videos: Video[]) => {
  console.log('Saving videos to Firebase:', videos);
  await setDoc(doc(db, COLLECTION_NAME, VIDEOS_DOC), { videos });
  console.log('Videos saved successfully');
};

export const loadVideos = async (): Promise<Video[]> => {
  const docRef = doc(db, COLLECTION_NAME, VIDEOS_DOC);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log('Loaded videos from Firebase:', data.videos);
    return data.videos || [];
  }
  console.log('No videos document found in Firebase');
  return [];
};

