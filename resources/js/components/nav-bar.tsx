// /components/nav-bar.tsx
import Image from "next/image";
import { NavUser } from "@/components/nav-user";

export function NavBar() {
  return (
    <header className="w-full flex items-center justify-between bg-white border-b px-4 py-2 shadow-sm">
      {/* Bagian kiri: Logo */}
      <div className="flex items-center gap-4">
        <Image
          src="/logo-antara.png" // ganti sesuai path logo kamu
          alt="Antara Logo"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
        />
        <Image
          src="/logo-pln.png" // ganti sesuai path logo kamu
          alt="PLN Logo"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Bagian kanan: User */}
      <div className="flex items-center">
        <NavUser />
      </div>
    </header>
  );
}
