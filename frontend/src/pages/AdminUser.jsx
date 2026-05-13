import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AdminUser() {

  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/admin/users/${id}`);

      setData(res.data.data);

    } catch (err) {
      console.log(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-red-400">
        User not found
      </div>
    );
  }

  const user = data.user;

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-6 space-y-6">

          <div className="bg-white/5 p-6 rounded-2xl">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-white/5 p-4 rounded-xl">
              Workouts: {data.totalWorkouts}
            </div>

            <div className="bg-white/5 p-4 rounded-xl">
              Calories: {data.totalCalories}
            </div>

            <div className="bg-white/5 p-4 rounded-xl">
              Diet: {data.totalDietCalories}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}