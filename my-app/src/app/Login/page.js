export default function Login() {
    return (
      <>
        {/* Navigation Bar */}
        <nav className="bg-black dark:bg-zinc-800 shadow-md">
          {/* ...Navigation Bar Content... */}
        </nav>
  
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          {/* Login Form with Increased Size */}
          <div className="login-form bg-white p-10 rounded-lg shadow-lg" style={{ width: '500px' }}>
            <h2 className="text-lg font-semibold mb-4">Login</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" id="username" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" id="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
              </div>
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4">
                Login
              </button>
              {/* <button onClick={() => window.location.href='/Register'} type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Don't have an account? Sign Up!
              </button> */}
            </form>
          </div>
        </main>
      </>
    )
  }
  