// Simple Firebase test
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsdPghRmOsLX7JIj-T8IYF4bRp-KxQAPc",
  authDomain: "cybee-ca5a2.firebaseapp.com",
  projectId: "cybee-ca5a2",
  storageBucket: "cybee-ca5a2.firebasestorage.app",
  messagingSenderId: "215321650697",
  appId: "1:215321650697:web:d0bbf35f6861a891c9bad8",
  measurementId: "G-K624Y57R5Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test function
async function testFirebase() {
  try {
    console.log("Testing Firebase connection...");
    
    // Test write
    const testData = { 
      videos: [
        {
          id: "test1",
          title: "Test Video",
          description: "Test Description",
          url: "https://youtube.com/watch?v=test",
          videoId: "test"
        }
      ]
    };
    
    await setDoc(doc(db, "supportApp", "videos"), testData);
    console.log("✅ Write successful");
    
    // Test read
    const docSnap = await getDoc(doc(db, "supportApp", "videos"));
    if (docSnap.exists()) {
      console.log("✅ Read successful:", docSnap.data());
    } else {
      console.log("❌ Document not found");
    }
    
  } catch (error) {
    console.error("❌ Firebase test failed:", error);
  }
}

// Run test
testFirebase();