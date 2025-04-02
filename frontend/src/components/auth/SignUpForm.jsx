import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios.js";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";
const SignUpForm = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, SetEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: signupMutation, isLoading } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfull");
    },
    onError: (error) => {
      toast.error(error.response.data.message || "something went wrong");
    },
  });
  const handleSignUp = (e) => {
    e.preventDefault();
    signupMutation({ name, username, email, password });
  };

  return (
    <form onSubmit={handleSignUp}>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          className="input input-bordered w-full"
          required
        />

        <input
          type="text"
          placeholder="UserName"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          className="input input-bordered w-full"
          required
        />

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            SetEmail(e.target.value);
          }}
          className="input input-bordered w-full"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          className="input input-bordered w-full"
          required
        />
      </div>

      <button className="btn btn-primary w-full text-white my-2">
        {isLoading ? (
          <Loader className="size-5 animate-spin" />
        ) : (
          "Agree and join"
        )}
      </button>
    </form>
  );
};

export default SignUpForm;
