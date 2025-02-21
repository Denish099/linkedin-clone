import React from "react";
import NavBar from "./navBar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-base-100">
      <NavBar />
      <main className="max-w-7xl mx-auto px-100 py-6">{children}</main>
    </div>
  );
};

export default Layout;
