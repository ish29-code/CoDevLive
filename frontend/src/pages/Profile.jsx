import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X } from "lucide-react";
import { SKILLS } from "@/data/skills";

export default function Profile() {
  const { theme } = useTheme();
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    name: "Your Name",
    school: "Your School",
    college: "Your College",
    location: "Your City, Country",
    bio: "Write something about yourself...",
    skills: ["React", "Node.js"],
    linkedin: "",
    github: "",
    twitter: "",
    photo: null,
    resume: null,
  });

  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditMode(false);
    toast.success("Profile updated successfully ✨");
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

  /* ================= UI ================= */

  return (
    <div className="
      min-h-screen flex items-center justify-center px-4
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
              <img
                src={URL.createObjectURL(profile.photo)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm opacity-70">Upload Photo</span>
            )}
          </div>

          {editMode && (
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setProfile({ ...profile, photo: e.target.files[0] })
              }
              className="max-w-xs"
            />
          )}function
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

          {/* Skill Chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className={`
                  flex items-center gap-1 px-3 py-1 rounded-full text-sm
                  ${theme === "light"
                    ? "bg-yellow-200 text-black"
                    : "bg-orange-500 text-white"}
                `}
              >
                {skill}
                {editMode && (
                  <X size={14} className="cursor-pointer" onClick={() => removeSkill(skill)} />
                )}
              </span>
            ))}
          </div>

          {/* Skill Search */}
          {editMode && (
            <div className="relative">
              <Input
                value={skillInput}
                onChange={handleSkillInput}
                placeholder="Search skills..."
              />

              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-[var(--card)] border rounded-lg shadow max-h-40 overflow-y-auto">
                  {suggestions.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className={`
                        w-full text-left px-4 py-2 text-sm transition
                        ${theme === "light"
                          ? "hover:bg-yellow-100"
                          : "hover:bg-orange-900"}
                      `}
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

          {editMode ? (
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setProfile({ ...profile, resume: e.target.files[0] })
              }
            />
          ) : (
            <p className="text-sm opacity-70">
              {profile.resume ? profile.resume.name : "No resume uploaded"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
