import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="w-20 fixed h-full bg-black text-white pt-20 hidden md:block">
      <div className="flex flex-col space-y-6 p-4 items-center">
        <Link to="/" className="flex flex-col items-center text-white hover:text-red-500 p-2 rounded-lg">
          {/* Home Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </Link>

        <a href="#" className="flex flex-col items-center text-gray-400 hover:text-white p-2 rounded-lg">
          {/* Settings Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0..." />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs">Settings</span>
        </a>
      </div>
    </div>
  );
}
