import Navbar from "@/components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
  const { theme } = useTheme();
  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
        <p>This is the profile page. User details will be displayed here.</p>
      </div>
    </>
  );
}