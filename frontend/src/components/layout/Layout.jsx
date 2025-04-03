import React from "react";
import NavBar from "./navBar";
import { useQuery } from "@tanstack/react-query";

const Layout = ({ children }) => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
  });

  console.log("auth user is in layout", authUser);
  return (
    <div className="min-h-screen bg-base-100">
      <NavBar />
      <main className="max-w-7xl mx-auto px-100 py-6">{children}</main>
    </div>
  );
};

export default Layout;
