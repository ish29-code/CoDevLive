// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-900 text-center py-4 mt-10">
      <p className="text-gray-700 dark:text-gray-300">
        © {new Date().getFullYear()} DevSphere. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
