import { useState } from 'react'
import navbarLogo from './assets/Icon.png'
import loginLogo from './assets/Background.png'


function App() {
  const [loginType, setLoginType] = useState('citizen')
  const isEngineer = loginType === 'engineer'

  return (
    <>
      {/* navbar */}
      <header>
        <nav className="flex items-center gap-3 p-10 border-b border-gray-200">
          <img className="h-10 w-10" src={navbarLogo} alt="CityPulse logo" />
          <h1 className="text-2xl font-bold text-[#00342B]">CityPulse</h1>
        </nav>
      </header>

      {/*Login section*/}
      <section>
        <div className="LoginSection mx-auto flex w-full max-w-sm flex-col">
          <div className="authChoice mb-12 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-medium">
            <button
              className={`rounded-md px-4 py-2 ${
                loginType === 'citizen'
                  ? 'bg-[#00342B] text-white'
                  : 'text-gray-700'
              }`}
              type="button"
              onClick={() => setLoginType('citizen')}
            >
              Citizen
            </button>
            <button
              className={`rounded-md px-4 py-2 ${
                isEngineer
                  ? 'bg-[#00342B] text-white'
                  : 'text-gray-700'
              }`}
              type="button"
              onClick={() => setLoginType('engineer')}
            >
              Engineer
            </button>
          </div>

          <div className="profile mb-10 flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-[#005C4C]">
              <img className="h-8 w-8" src={loginLogo} alt="CityPulse logo" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-black">
              Welcome to CityPulse
            </h2>
            <p className="max-w-64 text-sm leading-5 text-gray-600">
              Log in to your {isEngineer ? 'engineer' : 'citizen'} account to{' '}
              {isEngineer
                ? 'manage and resolve local issues.'
                : 'report and track local issues.'}
            </p>
          </div>

          <div className="logForm">
            <form className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm text-black">
                Email Address
                <input
                  className="h-11 border border-gray-300 px-4 text-sm outline-none focus:border-[#00342B]"
                  type="email"
                  placeholder="name@example.com"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-black">
                <span className="flex items-center justify-between">
                  Password
                  <a className="text-xs font-medium text-[#00342B]" href="#">
                    Forgot Password?
                  </a>
                </span>
                <input
                  className="h-11 border border-gray-300 px-4 text-sm outline-none focus:border-[#00342B]"
                  type="password"
                  placeholder="********"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-black">
                <input className="h-4 w-4 accent-[#00342B]" type="checkbox" />
                Remember me
              </label>

              <button
                className="mt-3 h-12 rounded-lg bg-[#005C4C] text-sm font-medium text-white"
                type="submit"
              >
                Sign In
              </button>
            </form>

            <p className="mt-10 text-center text-sm text-black">
              New to CityPulse?{' '}
              <a className="font-medium text-[#00342B]" href="#">
                Create {isEngineer ? 'an engineer' : 'a citizen'} account
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
