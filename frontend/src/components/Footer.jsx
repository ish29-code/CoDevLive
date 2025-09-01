import React from "react";

const Footer = () => {
  return (
    <footer className="flex justify-center items-center w-full bg-gray-800 dark:bg-gray-900 py-3">
      <p className="text-center w-[30%] text-white dark:text-gray-300">
        © {new Date().getFullYear()} CoDevLive. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
