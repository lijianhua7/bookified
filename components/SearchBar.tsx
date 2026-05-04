"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get("q") || "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q")?.toString() || "";
    
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          name="q"
          type="text"
          defaultValue={defaultQuery}
          placeholder="按书名或作者搜索..."
          className="pl-9 rounded-full bg-white border-[#E6E0D8] focus-visible:ring-[#8C7A6B] text-[#4D3E35] shadow-sm"
        />
      </div>
    </form>
  );
}
