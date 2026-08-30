function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} CKKC Electrical Supply. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;