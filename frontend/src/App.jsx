import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";

import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./lib/axios";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          return null;
        }
        toast.error(error.response.data.message || "something went wrong");
      }
    },
  });
  if (isLoading) {
    return null;
  }
  return (
    <Layout>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Login />} />
        <Route
          path="/signup"
          element={!authUser ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Toaster />
    </Layout>
  );
}

export default App;
