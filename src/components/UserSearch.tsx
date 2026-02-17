import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchGithubUser, SearchGithubUser } from "../api/github";
import UserCard from "./UserCard";
import RecentSearches from "./RecentSearch";
import { useDebounce } from "use-debounce";
import type { GithubUser } from "../types";

const UserSearch = () => {
  const [userName, setUsername] = useState("");
  const [submittedUsername, setSubmittedUsername] = useState("");
  const [recentUsers, setRecentUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentUsers");
    return stored ? JSON.parse(stored) : [];
  });

  const [debouncedUsername] = useDebounce(userName, 300); // Wait 300ms before making request
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Query to fetch specific user
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", submittedUsername],
    queryFn: () => fetchGithubUser(submittedUsername),
    // !! turn into a boolean
    enabled: !!submittedUsername,
  });

  // Query to fetch suggestions for user search
  const { data: suggestions } = useQuery({
    queryKey: ["github-user-suggestions", debouncedUsername],
    queryFn: () => SearchGithubUser(debouncedUsername),
    enabled: debouncedUsername.length > 1,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = userName.trim();

    if (!trimmed) return;

    setSubmittedUsername(trimmed);
    setUsername("");
    setRecentUsers((prev) => {
      const updated = [trimmed, ...prev.filter((u) => u !== trimmed)];

      return updated.slice(0, 5);
    });
  };

  useEffect(() => {
    localStorage.setItem("recentUsers", JSON.stringify(recentUsers));
  }, [recentUsers]);
  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <div className="dropdown-wrapper">
          <input
            type="text"
            placeholder="Enter Github Username..."
            value={userName}
            onChange={(e) => {
              const val = e.target.value;
              setUsername(val);
              setShowSuggestions(val.trim().length > 1);
            }}
          />
          {showSuggestions && suggestions?.length > 0 && (
            <ul className="suggestions">
              {suggestions.slice(0, 5).map((user: GithubUser) => (
                <>
                  <li key={user.login}>
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="avatar-xs"
                    />{" "}
                    {user.login}
                  </li>
                </>
              ))}
            </ul>
          )}
        </div>

        <button type="submit">Search</button>
      </form>

      {isLoading && <p className="status">Loading...</p>}
      {isError && <p className="status error">{error.message}</p>}

      {data && <UserCard user={data} />}

      {recentUsers.length > 0 && (
        <RecentSearches
          users={recentUsers}
          onSelect={(username) => {
            setUsername(username);
            setSubmittedUsername(username);
          }}
        />
      )}
    </>
  );
};

export default UserSearch;
