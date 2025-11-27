import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Video } from "../types";

const COLLECTION_NAME = "supportApp";
const VIDEOS_DOC = "videos";
const SQL_QUERIES_DOC = "sqlQueries";

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

export const saveSqlQueries = async (queries: {id: string, title: string, query: string}[]) => {
  console.log('Saving SQL queries to Firebase:', queries);
  await setDoc(doc(db, COLLECTION_NAME, SQL_QUERIES_DOC), { queries });
  console.log('SQL queries saved successfully');
};

export const loadSqlQueries = async (): Promise<{id: string, title: string, query: string}[]> => {
  const docRef = doc(db, COLLECTION_NAME, SQL_QUERIES_DOC);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log('Loaded SQL queries from Firebase:', data.queries);
    return data.queries || [];
  }
  console.log('No SQL queries document found in Firebase');
  return [];
};

const LINKS_DOC = "links";

export const saveLinks = async (links: {id: string, title: string, url: string, description: string}[]) => {
  console.log('Saving links to Firebase:', links);
  await setDoc(doc(db, COLLECTION_NAME, LINKS_DOC), { links });
  console.log('Links saved successfully');
};

export const loadLinks = async (): Promise<{id: string, title: string, url: string, description: string}[]> => {
  const docRef = doc(db, COLLECTION_NAME, LINKS_DOC);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log('Loaded links from Firebase:', data.links);
    return data.links || [];
  }
  console.log('No links document found in Firebase');
  return [];
};

