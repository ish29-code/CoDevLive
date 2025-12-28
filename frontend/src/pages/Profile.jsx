import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X } from "lucide-react";
import { SKILLS } from "@/data/skills";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { theme } = useTheme();
  const { updateUser, user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ ADDED

  // ✅ Persistent profile state (URLs)
  const [profile, setProfile] = useState({
    name: "",
    school: "",
    college: "",
    location: "",
    bio: "",
    skills: [],
    linkedin: "",
    github: "",
    twitter: "",
    photo: "",
    resume: "",
  });

  // ✅ Temp file states (only while editing)
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* ================= LOAD PROFILE ON REFRESH ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();

          setProfile({
            name: data.name || "",
            school: data.school || "",
            college: data.college || "",
            location: data.location || "",
            bio: data.bio || "",
            skills: data.skills || [],
            linkedin: data.linkedin || "",
            github: data.github || "",
            twitter: data.twitter || "",
            photo: data.photo || "",
            resume: data.resume || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false); // ✅ ADDED
      }
    };

    loadProfile();
  }, []);

  /* ================= CLEAR PROFILE ON LOGOUT ================= */
  useEffect(() => {
    if (!user) {
      setProfile({
        name: "",
        school: "",
        college: "",
        location: "",
        bio: "",
        skills: [],
        linkedin: "",
        github: "",
        twitter: "",
        photo: "",
        resume: "",
      });

      setPhotoFile(null);
      setResumeFile(null);
      setEditMode(false);
      setSkillInput("");
      setSuggestions([]);
    }
  }, [user]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const formData = new FormData();

      formData.append("name", profile.name);
      formData.append("school", profile.school);
      formData.append("college", profile.college);
      formData.append("location", profile.location);
      formData.append("bio", profile.bio);
      formData.append("linkedin", profile.linkedin);
      formData.append("github", profile.github);
      formData.append("twitter", profile.twitter);
      formData.append("skills", JSON.stringify(profile.skills));

      if (photoFile) formData.append("photo", photoFile);
      if (resumeFile) formData.append("resume", resumeFile);

      const res = await fetch("http://localhost:5000/api/profile/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }

      const data = await res.json();

      setProfile((prev) => ({
        ...prev,
        photo: data.photo || prev.photo,
        resume: data.resume || prev.resume,
      }));

      updateUser({
        name: data.name,
        photoURL: data.photo,
      });

      setPhotoFile(null);
      setResumeFile(null);
      setEditMode(false);

      toast.success("Profile updated successfully ✨");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSkillInput = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = SKILLS.filter(
      (skill) =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !profile.skills.includes(skill)
    );

    setSuggestions(filtered.slice(0, 6));
  };

  const addSkill = (skill) => {
    setProfile({ ...profile, skills: [...profile.skills, skill] });
    setSkillInput("");
    setSuggestions([]);
  };

  const removeSkill = (skill) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  };

  /* ================= LOADER ================= */
  if (loading) {
    const isLight = theme === "light";

    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(
          to bottom right,
          var(--gradient-start),
          var(--gradient-end)
        )`,
        }}
      >
        <div
          className={`
          w-[100px] h-[100px] border-4 rounded-full animate-spin
          border-[var(--accent)]
          border-t-transparent
        `}
        />
      </div>
    );
  }



  /* ================= UI ================= */



  return (
    <div className="
      min-h-screen flex items-center justify-center px-3 py-10
      bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)]
    ">
      <div className="
        w-full max-w-2xl bg-[var(--card)] text-[var(--card-foreground)]
        border border-[var(--border)] rounded-2xl shadow-xl p-8
      ">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>

          {editMode ? (
            <Button onClick={handleSave} className="btn-primary">
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setEditMode(true)} className="btn-outline">
              Edit Profile
            </Button>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="
            w-28 h-28 rounded-full bg-[var(--background)]
            border border-[var(--border)] flex items-center justify-center overflow-hidden
          ">
            {profile.photo ? (
              <img src={profile.photo} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm opacity-70">Upload Photo</span>
            )}
          </div>

          {editMode && (
            <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="max-w-xs" />
          )}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Input name="name" value={profile.name} onChange={handleChange} disabled={!editMode} placeholder="Full Name" />
          <Input name="school" value={profile.school} onChange={handleChange} disabled={!editMode} placeholder="School" />
          <Input name="college" value={profile.college} onChange={handleChange} disabled={!editMode} placeholder="College" />
          <Input name="location" value={profile.location} onChange={handleChange} disabled={!editMode} placeholder="Location" />
          <Input name="bio" value={profile.bio} onChange={handleChange} disabled={!editMode} placeholder="Short Bio" />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Input name="linkedin" value={profile.linkedin} onChange={handleChange} disabled={!editMode} placeholder="LinkedIn URL" />
          <Input name="github" value={profile.github} onChange={handleChange} disabled={!editMode} placeholder="GitHub URL" />
          <Input name="twitter" value={profile.twitter} onChange={handleChange} disabled={!editMode} placeholder="Twitter URL" />
        </div>

        {/* Skills */}
        <div className="mt-6">
          <label className="font-medium mb-2 block">Skills</label>

          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className={`
                  flex items-center gap-1 px-3 py-1 rounded-full text-sm
                  ${theme === "light" ? "bg-yellow-200 text-black" : "bg-orange-500 text-white"}
                `}
              >
                {skill}
                {editMode && <X size={14} className="cursor-pointer" onClick={() => removeSkill(skill)} />}
              </span>
            ))}
          </div>

          {editMode && (
            <div className="relative">
              <Input value={skillInput} onChange={handleSkillInput} placeholder="Search skills..." />

              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-[var(--card)] border rounded-lg shadow max-h-40 overflow-y-auto">
                  {suggestions.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className={`${theme === "light" ? "hover:bg-yellow-100" : "hover:bg-orange-900"} w-full text-left px-4 py-2 text-sm`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resume */}
        <div className="mt-6">
          <label className="block mb-2 font-medium">Resume</label>

          {profile.resume ? (
            <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              Download Resume
            </a>
          ) : (
            <p className="text-sm opacity-70">No resume uploaded</p>
          )}

          {editMode && (
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} className="mt-2" />
          )}
        </div>
      </div>
    </div>
  );
}
