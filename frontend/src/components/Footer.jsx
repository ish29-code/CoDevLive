import React from "react";
import { Github, Linkedin, Mail, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const socials = [
  {
    href: "https://github.com/ish29-code",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://linkedin.com/in/ishika-deshpande-67ab06285/",
    icon: Linkedin,
    label: "LinkedIn",
  },
  {
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=ishikadeshpande03@gmail.com",
    icon: Mail,
    label: "Email",
  },
];

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
      <div className="container-center py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* 🌟 Brand */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--accent)]">
            CoDevLive
          </h2>
          <p className="text-sm opacity-70 leading-relaxed">
            A collaborative coding platform for learning, interviews, and real-time
            development. Build, learn, and grow together.
          </p>
        </div>

        {/* 🔗 Quick Links */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/playground" className="nav-link">Playground</Link></li>
            <li><Link to="/profile" className="nav-link">Profile</Link></li>
            <li><Link to="/settings" className="nav-link">Settings</Link></li>
          </ul>
        </div>

        {/* 🌐 Socials */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Connect</h3>

          <div className="flex items-center gap-4">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="
                  p-2 rounded-full
                  border border-[var(--border)]
                  hover:bg-[var(--accent)]
                  hover:text-[var(--accent-foreground)]
                  transition-all duration-300
                  hover:scale-110
                "
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          <p className="text-xs opacity-60">
            Reach out anytime for support or collaboration
          </p>
        </div>
      </div>

      {/* 🔻 Bottom Bar */}
      <div className="border-t border-[var(--border)] py-4 text-center text-sm bg-[var(--background)]">
        <p className="flex items-center justify-center gap-1 opacity-70">
          © {new Date().getFullYear()} CoDevLive. Built with
          <Heart size={14} className="text-red-500 animate-pulse" />
          by Ishika
        </p>
      </div>
    </footer>
  );
};

export default Footer;
