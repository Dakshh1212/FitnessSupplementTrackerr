
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const badgeClass = (type) => {
  const styles = {
    admin: "border-purple-400/20 bg-purple-500/10 text-purple-300",
    user: "border-blue-400/20 bg-blue-500/10 text-blue-300",
    active: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    banned: "border-red-400/20 bg-red-500/10 text-red-300",
    complete: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    incomplete: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  };
  return styles[type] || styles.user;
};

export default function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/admin/users");
      const data = response.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setUsers(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const counts = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.role === "admin").length,
    active: users.filter((user) => Number(user.isBanned) !== 1).length,
    onboarding: users.filter(
      (user) => Number(user.isOnboardingComplete) === 1
    ).length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !term ||
        [user.name, user.email, String(user.id)]
          .some((value) => String(value || "").toLowerCase().includes(term));

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const banned = Number(user.isBanned) === 1;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "banned" && banned) ||
        (statusFilter === "active" && !banned);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleDelete = async (user, event) => {
    event.stopPropagation();

    if (deletingId !== null) return;

    const confirmed = window.confirm(
      `Permanently delete ${user.name || user.email || "this user"}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(user.id);
    setError("");
    setNotice("");

    try {
      await API.delete(`/admin/users/${user.id}`);
      setUsers((previous) =>
        previous.filter((item) => String(item.id) !== String(user.id))
      );
      setNotice("User deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to delete this user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const panelClass =
    "rounded-2xl border border-white/10 bg-[#111622] p-5";

  const statCards = [
    {
      label: "Registered users",
      value: counts.total,
      icon: "👥",
      description: "All registered accounts",
    },
    {
      label: "Administrator accounts",
      value: counts.admins,
      icon: "🛡️",
      description: "Accounts with admin access",
    },
    {
      label: "Active accounts",
      value: counts.active,
      icon: "✓",
      description: "Accounts not currently banned",
    },
    {
      label: "Onboarding completed",
      value: counts.onboarding,
      icon: "🎯",
      description: "Users who finished setup",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080d19] text-white">
      <Sidebar />

      <div className="min-w-0 lg:ml-64">
        <Navbar />

        <main className="space-y-6 px-4 py-6 pt-20 sm:px-6 lg:pt-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Management console
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Manage accounts and access individual user profiles. Each
                user's fitness information is available separately.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh users"}
            </button>
          </header>

          {error && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchData}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200"
            >
              {notice}
            </div>
          )}

          <section aria-label="Account overview">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-200">Account overview</h2>
              <span className="text-xs text-gray-500">
                {loading ? "Updating..." : "Live account list"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat) => (
                <article
                  key={stat.label}
                  className={`${panelClass} transition hover:border-emerald-400/20`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg">
                      {stat.icon}
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-bold tabular-nums">
                    {loading && users.length === 0
                      ? "—"
                      : formatNumber(stat.value)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {stat.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${panelClass} space-y-5`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">User management</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Select a user to inspect their fitness information separately.
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {formatNumber(filteredUsers.length)}{" "}
                {filteredUsers.length === 1 ? "account" : "accounts"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or user ID..."
                aria-label="Search users"
                className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-emerald-400/50"
              />

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter by role"
                className="rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-gray-200 outline-none focus:border-emerald-400/50"
              >
                <option value="all">All roles</option>
                <option value="admin">Administrators</option>
                <option value="user">Regular users</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by account status"
                className="rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-gray-200 outline-none focus:border-emerald-400/50"
              >
                <option value="all">All statuses</option>
                <option value="active">Active accounts</option>
                <option value="banned">Banned accounts</option>
              </select>
            </div>

            {loading && users.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                Loading accounts...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-12 text-center">
                <p className="font-medium text-gray-300">No users found</p>
                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-3 py-4 font-medium">User</th>
                      <th className="px-3 py-4 font-medium">Role</th>
                      <th className="px-3 py-4 font-medium">Account status</th>
                      <th className="px-3 py-4 font-medium">Onboarding</th>
                      <th className="px-3 py-4 font-medium">Registered</th>
                      <th className="px-3 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => {
                      const isBanned = Number(user.isBanned) === 1;
                      const onboardingComplete =
                        Number(user.isOnboardingComplete) === 1;

                      return (
                        <tr
                          key={user.id}
                          className="transition hover:bg-white/[0.025]"
                        >
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 font-semibold text-emerald-300">
                                {(user.name || user.email || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-[230px] truncate font-medium text-gray-100">
                                  {user.name || "Unnamed user"}
                                </p>
                                <p className="max-w-[230px] truncate text-xs text-gray-500">
                                  {user.email || "No email"} · ID {user.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(
                                user.role === "admin" ? "admin" : "user"
                              )}`}
                            >
                              {user.role === "admin" ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(
                                isBanned ? "banned" : "active"
                              )}`}
                            >
                              {isBanned ? "Banned" : "Active"}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(
                                onboardingComplete ? "complete" : "incomplete"
                              )}`}
                            >
                              {onboardingComplete ? "Completed" : "Pending"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-400">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/admin/user/${user.id}`)
                                }
                                className="whitespace-nowrap rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                              >
                                View profile →
                              </button>
                              <button
                                type="button"
                                disabled={
                                  deletingId !== null ||
                                  String(user.id) ===
                                    String(
                                      JSON.parse(
                                        localStorage.getItem("user") || "{}"
                                      ).id
                                    )
                                }
                                onClick={(event) => handleDelete(user, event)}
                                className="rounded-lg border border-red-400/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                                title={
                                  String(user.id) ===
                                  String(
                                    JSON.parse(
                                      localStorage.getItem("user") || "{}"
                                    ).id
                                  )
                                    ? "You cannot delete your own account"
                                    : "Delete user"
                                }
                              >
                                {String(deletingId) === String(user.id)
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="pb-4 text-center text-xs text-gray-600">
            FitTrack · Admin Console
          </footer>
        </main>
      </div>
    </div>
  );
}
