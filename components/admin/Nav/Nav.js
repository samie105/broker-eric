"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "../../../components/ui/sheet";
import { ScrollArea } from "../../../components/ui/scroll-area";

export default function Nav() {
  const pathname = usePathname();
  const isAdminHome = pathname === "/admin";
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="w-full px-4 py-4 fixed z-50 shadow-muted shadow-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="name-section font-bold text-lg flex items-center gap-x-2">
          {isClient && !isAdminHome && (
            <Link href="/admin" passHref>
              <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          )}
          Capital Nexus | Admin
        </div>
        
        <div className="flex items-center gap-x-3">
          {/* Hamburger Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-6 h-6"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 bg-white">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-xl font-bold">
                  Admin Navigation
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="p-4 space-y-3">
                  <NavItem 
                    href="/admin" 
                    icon={<DashboardIcon />} 
                    bgColor="bg-red-50/80" 
                    textColor="text-red-700"
                    label="Admin Dashboard"
                    isActive={pathname === "/admin"}
                  />
                  
                  <NavItem 
                    href="/admin/staking-options" 
                    icon={<PieChartIcon />} 
                    bgColor="bg-indigo-50/80" 
                    textColor="text-indigo-700"
                    label="Staking Options"
                    isActive={pathname.includes("/admin/staking-options")}
                  />
                  
                  <NavItem 
                    href="/admin/stakes/create" 
                    icon={<PlusIcon />} 
                    bgColor="bg-purple-50/80" 
                    textColor="text-purple-700"
                    label="Create Staking"
                    isActive={pathname.includes("/admin/stakes/create")}
                  />
                  
                  <NavItem 
                    href="/admin/stakings" 
                    icon={<TransactionIcon />} 
                    bgColor="bg-orange-50/80" 
                    textColor="text-orange-700"
                    label="Transactions"
                    isActive={pathname.includes("/admin/stakings")}
                  />
                  
                  <NavItem 
                    href="/admin/investment-plans" 
                    icon={<MoneyIcon />} 
                    bgColor="bg-blue-50/80" 
                    textColor="text-blue-700"
                    label="Investment Plans"
                    isActive={pathname.includes("/admin/investment-plans")}
                  />
                  
                  <NavItem 
                    href="/admin/investments" 
                    icon={<ListIcon />} 
                    bgColor="bg-green-50/80" 
                    textColor="text-green-700"
                    label="Manage Investments"
                    isActive={pathname.includes("/admin/investments")}
                  />
                  
                  <NavItem 
                    href="/admin/edit-address" 
                    icon={<EditIcon />} 
                    bgColor="bg-black/5" 
                    textColor="text-gray-700"
                    label="Edit Address"
                    isActive={pathname.includes("/admin/edit-address")}
                  />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          {/* Dashboard Icon Always Visible */}
          <Link passHref href="/admin">
            <div className="bg-red-50/80 p-3 rounded-full">
              <DashboardIcon />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Navigation Item Component
function NavItem({ href, icon, bgColor, textColor, label, isActive }) {
  return (
    <Link href={href} passHref>
      <div className={`flex items-center gap-x-3 p-3 rounded-md cursor-pointer ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <div className={textColor}>{icon}</div>
        </div>
        <span className="font-medium text-gray-800">{label}</span>
      </div>
    </Link>
  );
}

// Icons
function DashboardIcon() {
  return (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
      className="w-5 h-5"
              >
                <path d="M4 5h12v7H4V5z" />
                <path
                  fillRule="evenodd"
                  d="M1 3.5A1.5 1.5 0 012.5 2h15A1.5 1.5 0 0119 3.5v10a1.5 1.5 0 01-1.5 1.5H12v1.5h3.25a.75.75 0 010 1.5H4.75a.75.75 0 010-1.5H8V15H2.5A1.5 1.5 0 011 13.5v-10zm16.5 0h-15v10h15v-10z"
                  clipRule="evenodd"
                />
              </svg>
  );
}

function PieChartIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className="w-5 h-5"
    >
      <path d="M12 9a1 1 0 01-1-1V3c0-.553.45-1.008.997-.93a7.004 7.004 0 015.933 5.933c.078.547-.378.997-.93.997h-5z" />
      <path d="M8.003 4.07C8.55 3.992 9 4.447 9 5v5a1 1 0 001 1h5c.552 0 1.008.45.93.997A7.001 7.001 0 012 11a7.002 7.002 0 016.003-6.93z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className="w-5 h-5"
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className="w-5 h-5"
    >
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className="w-5 h-5"
    >
      <path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zM1.75 12h16.5a.75.75 0 010 1.5H1.75a.75.75 0 010-1.5z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon() {
  return (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
  );
}

function TransactionIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className="w-5 h-5"
    >
      <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z" clipRule="evenodd" />
    </svg>
  );
}
