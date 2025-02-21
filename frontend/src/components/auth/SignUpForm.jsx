import { useState } from "react";
const SignUpForm = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, SetEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = (e) => {
    e.preventDefault();

    console.log(name, email, password, username);
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
        Agree and Join
      </button>
    </form>
  );
};

export default SignUpForm;
