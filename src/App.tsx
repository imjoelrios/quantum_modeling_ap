import { Routes, Route, Link } from "react-router-dom";
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

// === Pages ===
import {
  MainLayout,
  Home2,
  Tunneling,
  Interference,
  SpinTraceEvolution,
  // removed other pages for now
} from "./pages";
import Navbar from "./components/Navbar";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.measurementId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default function App() {
  return (
    <div>
        <Navbar/>
        <Routes>
            <Route path="/" element={<MainLayout />}>
            <Route index element={<Home2 />} />
            <Route path="*" element={<NoMatch />} />
            <Route path="/tunneling" element={<Tunneling />} />
            <Route path="/interference" element={<Interference />} />
            <Route path="/spintraceevo" element={<SpinTraceEvolution />} />
            </Route>
      </Routes>
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
