'use client'

import Image from 'next/image';

export default function Home() {
  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-black dark:bg-zinc-800 shadow-md">
        {/* ...Navigation Bar Content... */}
      </nav>

      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        {/* ...Existing Main Content... */}

        {/* Registration Form */}
        <div className="registration-form bg-white p-6 rounded-lg shadow-lg" style={{ width: '500px' }}>

          <h2 className="text-lg font-semibold mb-4">Register</h2>
          <form>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
            </div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" id="username" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
            </div>
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Create Account
            </button>
          </form>
          <button onClick={() => window.location.href='/Login'} className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Login with Existing Account
          </button>
        </div>
      </main>
    </>
  )
}
 
