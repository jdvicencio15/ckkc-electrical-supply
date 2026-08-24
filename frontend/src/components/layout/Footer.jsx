function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MERN Starter. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;