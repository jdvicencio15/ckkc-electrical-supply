
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <p className="text-6xl font-bold text-blue-600">
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
          Page Not Found
        </h1>

        <p className="mt-2 text-gray-600">
          Sorry, the page you are looking for does not exist.
        </p>

        <div className="mt-6">
          <Link to="/">
            <Button fullWidth>
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default NotFound;

