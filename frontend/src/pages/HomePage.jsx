import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import Sidebar from "../components/sidebar";
import PostCreation from "../components/postCreation";
import Post from "../components/post";

const HomePage = () => {
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });
  const { data: recommendedUser } = useQuery({
    queryKey: ["recommendedUser"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users/suggestions");
      return response.data;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await axiosInstance.get("/posts");
      return response.data;
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:colspan-1">
        <Sidebar user={authUser} />
      </div>
      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <PostCreation user={authUser} />
        {posts?.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
