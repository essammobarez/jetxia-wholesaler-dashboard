import Btoblogin from './btoblogin/page';
import { createMetadata } from "./layout";

// Generate dynamic metadata based on wholesaler branding
export const generateMetadata = createMetadata("/login", {
  title: "Login",
  description: "Welcome to your travel booking dashboard",
});

export default function Home() {
  return (
    <main>
      <Btoblogin/>
      {/* <Footer /> */}
    </main>
  );
}
