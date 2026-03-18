import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PaperNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <svg
        className="h-16 w-16 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">Paper Not Found</h2>
      <p className="mt-2 text-sm text-gray-500">
        The paper you are looking for does not exist or has been deleted.
      </p>
      <Link href="/papers" className="mt-6">
        <Button variant="primary">Back to Papers</Button>
      </Link>
    </div>
  );
}
