import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const UserSearch = () => {
  const [userName, setUsername] = useState("");
  const [submittedUsername, setSubmittedUsername] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", submittedUsername],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_GITHUB_API_URL}/users/${submittedUsername}`,
      );

      if (!res.ok) throw new Error("User not found");

      const data = await res.json();
      console.log(data);
      return data;
    },
    // !! turn into a boolean
    enabled: !!submittedUsername,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedUsername(userName.trim());
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Enter Github Username..."
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isLoading && <p className="status">Loading...</p>}
      {isError && <p className="status error">{error.message}</p>}

      {data && (
        <div className="user-card">
          <img src={data.avatar_url} alt={data.name} className="avatar" />
          <h2>{data.name}</h2>
        </div>
      )}
    </>
  );
};

export default UserSearch;
