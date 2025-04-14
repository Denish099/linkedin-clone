import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import Sidebar from "../components/sidebar";
import PostCreation from "../components/postCreation";
import RecommendedUser from "../components/recommenededUser";
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
  console.log(posts);
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
      {recommendedUser?.length > 0 && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block">
          <div className="bg-secondary rounded-lg shadow p-4">
            <h2 className="front-semibold mb-4">People may you know</h2>
            {recommendedUser.map((user) => (
              <RecommendedUser key={user._id} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
