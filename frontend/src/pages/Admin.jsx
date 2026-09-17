import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Admin() {

  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [userChart, setUserChart] = useState([]);
  const [workoutChart, setWorkoutChart] = useState([]);

  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {

      const [statsRes, usersRes, chartRes] =
        await Promise.all([

          API.get("/admin/stats", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          API.get("/admin/users", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          API.get("/admin/chart-data", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

        ]);

      setStats(statsRes.data.data);

      setUsers(usersRes.data.data);

      setUserChart(
        chartRes.data.data.users
      );

      setWorkoutChart(
        chartRes.data.data.workouts
      );

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= DELETE USER ================= */

  const handleDelete = async (
    id,
    e
  ) => {

    e.stopPropagation();

    const ok =
      window.confirm(
        "Delete this user permanently?"
      );

    if (!ok) return;

    try {

      await API.delete(
        `/admin/users/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert(
        "User deleted ✅"
      );

      setUsers(prev =>
        prev.filter(
          u => u.id !== id
        )
      );

    } catch (err) {

      console.log(err);

      alert(
        err?.response?.data?.message ||
        "Delete failed ❌"
      );

    }

  };

  /* ================= SEARCH ================= */

  const filtered =
    users.filter(u =>

      u.name
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )

      ||

      u.email
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )

    );

  const pieData =
    stats
      ? [
          {
            name:"Users",
            value:stats.users
          },
          {
            name:"Workouts",
            value:stats.workouts
          },
          {
            name:"Diet",
            value:stats.diets
          },
          {
            name:"Supplements",
            value:stats.supplements
          }
        ]
      : [];

  const COLORS=[
    "#22c55e",
    "#3b82f6",
    "#facc15",
    "#ef4444"
  ];

  return (

<div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white flex">

<Sidebar/>

<div className="flex-1">

<Navbar/>

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
Admin Dashboard
</h1>

{/* STATS */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

{stats && Object.entries(stats).map(([k,v],i)=>(

<div
key={i}
className="bg-white/5 border border-white/10 rounded-2xl p-5"
>

<p className="text-sm text-gray-400 capitalize">
{k}
</p>

<h2 className="text-2xl font-bold">
{v}
</h2>

</div>

))}

</div>

{/* CHARTS */}

{/* CHARTS */}

<div className="grid md:grid-cols-2 gap-6">

  {/* PIE */}

  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

    <h2 className="mb-3">
      System Overview
    </h2>

    <ResponsiveContainer
      width="100%"
      height={260}
    >

      <PieChart>

        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          outerRadius={90}
        >

          {pieData.map((_, i) => (

            <Cell
              key={i}
              fill={COLORS[i]}
            />

          ))}

        </Pie>

      </PieChart>

    </ResponsiveContainer>

  </div>

  {/* USER GROWTH */}

  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

    <h2 className="mb-3">
      User Growth
    </h2>

    <ResponsiveContainer
      width="100%"
      height={260}
    >

      <LineChart
        data={userChart}
      >

        <XAxis dataKey="date"/>

        <YAxis/>

        <Tooltip/>

        <Line
          type="monotone"
          dataKey="users"
          stroke="#6366f1"
          strokeWidth={3}
        />

      </LineChart>

    </ResponsiveContainer>

  </div>

</div>

{/* USERS */}

<div className="space-y-3">

<input
value={search}
onChange={(e)=>
setSearch(
e.target.value
)
}
placeholder="Search users..."
className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
/>

{filtered.map((u)=>(

<div
key={u.id}
onClick={()=>
navigate(
`/admin/user/${u.id}`
)
}
className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 cursor-pointer"
>

<div>

<p className="font-semibold">
{u.name}
</p>

<p className="text-sm text-gray-400">
{u.email}
</p>

</div>

<div className="flex items-center gap-3">

<button
onClick={(e)=>
handleDelete(
u.id,
e
)
}
className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm"
>

Delete

</button>

<span className="text-sm text-gray-400">

View →

</span>

</div>

</div>

))}

</div>

</div>

</div>

</div>

);

}