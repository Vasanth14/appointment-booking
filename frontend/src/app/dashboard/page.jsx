"use client";

import UserDashboard from "@/components/UserDashboard"
import AdminDashboard from "@/components/AdminDashboard"
import { useSelector } from "react-redux"
import { selectIsAdmin } from "@/store/slices/authSlice"

export default function Page() {
  return <DashboardContent />;
}

function DashboardContent() {
  const isAdmin = useSelector(selectIsAdmin);
  
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}
