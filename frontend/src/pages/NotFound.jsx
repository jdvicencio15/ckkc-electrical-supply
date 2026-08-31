import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <Card className="w-full max-w-md text-center">
        <p className="text-6xl font-bold text-green-600 dark:text-green-400">
          404
        </p>

        <h1 className="mt-4 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Page Not Found
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
          Sorry, the page you are looking for does not exist.
        </p>

        <div className="mt-6">
          <Link to="/">
            <Button fullWidth>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default NotFound;