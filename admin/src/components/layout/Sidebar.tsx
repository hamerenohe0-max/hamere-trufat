"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  TrendingUp,
  Calendar,
  CalendarDays,
  Image,
  Users,
  Bell,
  CheckCircle,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Articles", href: "/articles", icon: FileText },
  { name: "Progress Reports", href: "/progress", icon: TrendingUp },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Feasts", href: "/feasts", icon: CalendarDays },
  { name: "Media Library", href: "/media", icon: Image },
  { name: "Publishers", href: "/publishers", icon: CheckCircle },
  { name: "Users", href: "/users", icon: Users },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Profile Settings", href: "/profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-semibold">Hamere Trufat</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

