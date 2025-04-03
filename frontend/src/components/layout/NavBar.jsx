import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { Link } from "react-router-dom";
import { Bell, Home, LogOut, User, Users } from "lucide-react";
const NavBar = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });
  const { data: notifications } = useQuery({
    queryKey: ["notification"],
    queryFn: async () => axiosInstance.get("/notications"),
    enabled: !!authUser,
  });

  const { data: connectionRequest } = useQuery({
    queryKey: ["connectionRequest"],
    queryFn: async () => axiosInstance.get("/connections"),
    enabled: !!authUser,
  });

  const { mutate: logout } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const unReadNotificationCount = notifications?.data.filter(
    (noti) => !noti.read
  ).length;

  const unReadConnectionsReq = connectionRequest?.data?.lenght;
  return (
    <nav className="bg-secondary shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img
                className="h-8 rounded"
                src="/small-logo.png"
                alt="LinkedIn"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {authUser ? (
              <>
                <Link
                  to={"/"}
                  className="text-neutral flex flex-col items-center"
                >
                  <Home size={20} />
                  <span className="text-xs hidden md:block">Home</span>
                </Link>
                <Link
                  to="/network"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Users size={20} />
                  <span className="text-xs hidden md:block">My Network</span>
                  {unReadConnectionsReq > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
                rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {unReadConnectionsReq}
                    </span>
                  )}
                </Link>
                <Link
                  to="/notifications"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Bell size={20} />
                  <span className="text-xs hidden md:block">Notifications</span>
                  {unReadNotificationCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
                rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {unReadNotificationCount}
                    </span>
                  )}
                </Link>
                <Link
                  to={`/profile/${authUser.username}`}
                  className="text-neutral flex flex-col items-center"
                >
                  <User size={20} />
                  <span className="text-xs hidden md:block">Me</span>
                </Link>
                <button
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => logout()}
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
