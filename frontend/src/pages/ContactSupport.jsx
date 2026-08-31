import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  FaEnvelope,
  FaFacebookMessenger,
  FaPhone,
} from "react-icons/fa";

function ContactSupport() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Contact Support
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Need assistance with the CKKC system? Contact the
          system administrator using any of the options below.
        </p>
      </div>

      {/* Support Options */}
      <Card>
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
              <FaEnvelope className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Email
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                For general questions and system support.
              </p>

              <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                your-email@example.com
              </p>
            </div>
          </div>

          {/* Messenger */}
          <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
              <FaFacebookMessenger className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Messenger
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Send a message for assistance or technical concerns.
              </p>

              <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                Please message the administrator
              </p>
            </div>
          </div>

          {/* Contact Number */}
          <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
              <FaPhone className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Contact Number
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                For urgent concerns and immediate assistance.
              </p>

              <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                09XX XXX XXXX
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Back */}
      <div className="flex justify-end">
        <Link to="/dashboard">
          <Button variant="secondary">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ContactSupport;