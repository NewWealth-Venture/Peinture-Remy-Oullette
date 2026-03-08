import Image from "next/image";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[400px] bg-neutral-white border border-neutral-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <div className="relative h-14 w-40">
            <Image src="/logo.png" alt="" fill className="object-contain object-center" sizes="160px" priority />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
