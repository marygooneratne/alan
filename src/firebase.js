import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
    apiKey: "AIzaSyB-Ka1sSqIt_mhlKHE2hiIBLdXuixB2Uek",
    authDomain: "alan-taxes.firebaseapp.com",
    projectId: "alan-taxes",
    storageBucket: "alan-taxes.appspot.com",
    messagingSenderId: "31692548469",
    appId: "1:31692548469:web:afbd5ba64498ed999a4b3c",
    measurementId: "G-FL6C0RL62K"
  };

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();

const provider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = (referToId, referById, refundBreakdown) => {
  console.log("signing in with google")
  return auth.signInWithPopup(provider).then((result) => {
    if(referToId=="") {
      referToId = uuidv4();
    }
    console.log(referToId);
    // The signed-in user info.
    var user = result.user;
    const firstName = user.displayName.split(" ")[0];
    const lastName = "";
    const phone = user.phoneNumber;
    generateUserDocument(user, { firstName, lastName, phone, referToId, referById,refundBreakdown })
    // ...
  }).catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    console.log(error);
  });
};

export const getUserDoc = async (user) => {
  if (!user || !user.user) return;
  
  const userRef = firestore.collection('users').doc(user.user.uid);
  const doc = await userRef.get();
  if (!doc.exists) {
    console.log('No such document!');
    return null;
  } else {
    console.log('Document data:', doc.data());
    return doc.data()
  }
}

export const updateUser = async (uid, fields) => {
  try {
    const userRef = firestore.collection('users').doc(uid);
    const res = await userRef.update(fields);
    return res;
  } catch (error) {
    console.log("error updating record", error);
    return null;
  };
}

export const generateUserDocument = async (user, additionalData) => {
  if (!user) return;
  const userRef = firestore.doc(`users/${user.uid}`);
  
  const snapshot = await userRef.get();
  
  if (!snapshot.exists) {
    const { email, firstName, lastName, phone } = user;
    // const displayName = firstName;
    try {
      await userRef.set({
        firstName,
        lastName,
        email,
        phone,
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }

  return getUserDocument(user.uid);
};

export const getUserDocument = async uid => {
  if (!uid) return null;
  try {
    const userDocument = await firestore.doc(`users/${uid}`).get();
    console.log(userDocument.data());
    return {
      uid,
      ...userDocument.data()
    };
  } catch (error) {
    console.error("Error fetching user", error);
  }
};

export const findUserByEmail = async (email) => {
  if(!email) return null;
  try {
    const snapshot = await firestore.collection("users").where('email','==',email).get();
    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }  
    let user = {}
    
    snapshot.forEach(doc => {
      user = doc.data();
    });

    return user;
  } catch (error) {
    console.error("Error fetching user", error);
  }
}