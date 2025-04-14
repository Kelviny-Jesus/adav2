import { useEffect } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";

export default function VerifyCodeRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    // Redirect to the reset-code-verification page
    navigate(`/reset-code-verification?email=${encodeURIComponent(email)}`);
  }, [navigate, email]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c]">
      <h1 className="text-2xl text-white mb-4">Redirecting...</h1>
      <p className="text-gray-400">
        If you are not redirected automatically, click{" "}
        <a 
          href={`/reset-code-verification?email=${encodeURIComponent(email)}`}
          className="text-blue-500 hover:text-blue-400"
        >
          here
        </a>
      </p>
    </div>
  );
}
