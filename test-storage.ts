import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const storage = getStorage(app);

async function test() {
  try {
    await signInWithEmailAndPassword(auth, 'master@trackerpro.com', 'tracker123'); // assuming 'password' was used in earlier context
    const testRef = ref(storage, 'test.txt');
    await uploadString(testRef, 'hello');
    console.log('success');
  } catch (e: any) {
    console.error(e.message);
  }
}
test();
