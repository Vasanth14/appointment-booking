"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CalendarIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
} from "lucide-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSelector } from "react-redux";
import { selectIsAdmin, selectUser } from "@/store/slices/authSlice";
import Link from "next/link";

export function AppSidebar({ ...props }) {
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectUser);

  const adminNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Slots Management",
      url: "/dashboard/slots",
      icon: CalendarIcon,
    },
    {
      title: "All Bookings",
      url: "/dashboard/appointments",
      icon: ClipboardListIcon,
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
      icon: UsersIcon,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChartIcon,
    },
  ];

  const userNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Book Appointment",
      url: "/dashboard/book-appointment",
      icon: PlusIcon,
    },
    {
      title: "My Bookings",
      url: "/dashboard/my-bookings",
      icon: ListIcon,
    },
    {
      title: "Available Slots",
      url: "/dashboard/available-slots",
      icon: ClockIcon,
    },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const documents = isAdmin
    ? [
        {
          name: "Slot Reports",
          url: "/dashboard/slots",
          icon: DatabaseIcon,
        },
        {
          name: "Booking Reports",
          url: "/dashboard/appointments",
          icon: ClipboardListIcon,
        },
        {
          name: "Client Reports",
          url: "/dashboard/clients",
          icon: FileTextIcon,
        },
      ]
    : [
        {
          name: "My Appointments",
          url: "/dashboard/my-bookings",
          icon: ClipboardListIcon,
        },
        {
          name: "Book New",
          url: "/dashboard/book-appointment",
          icon: PlusIcon,
        },
        {
          name: "Past Bookings",
          url: "/dashboard/my-bookings?tab=past",
          icon: CheckCircleIcon,
        },
      ];

  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: "/avatars/user.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">
                  {isAdmin ? "Admin Panel" : "AppointMate"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavDocuments items={documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
