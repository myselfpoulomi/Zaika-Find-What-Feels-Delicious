import { useState, useRef, useEffect } from 'react'
import zaikaLogo from '../assets/zaika.png'
import { loginUser } from '../services/auth'

export default function LoginPage({ setCurrentPage, onLoginSuccess }) {
  // Mode: 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-new-password' | 'forgot-done'
  const [mode, setMode] = useState('login')

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', ''])
  const [generatedResetOtp, setGeneratedResetOtp] = useState('739104')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [timer, setTimer] = useState(45)
  const isResendActive = timer === 0

  const otpInputs = useRef([])

  // Timer countdown for Forgot Password OTP
  useEffect(() => {
    let interval = null
    if (mode === 'forgot-otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [mode, timer])

  // Handle Standard Login via HTTP-Only Cookies
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    if (!email.trim() || !email.includes('@')) {
      setLoginError('Please enter a valid email address')
      return
    }
    if (!password) {
      setLoginError('Please enter your password')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      })
      onLoginSuccess(data.user)
      setCurrentPage('home')
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Forgot Password: Step 1 Send OTP
  const handleForgotEmailSubmit = (e) => {
    e.preventDefault()
    setForgotError('')
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setForgotError('Please enter a valid email address')
      return
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedResetOtp(newCode)
    setTimer(45)
    setResetOtp(['', '', '', '', '', ''])
    setMode('forgot-otp')
  }

  // Forgot Password: Step 2 Handle OTP inputs
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6)
      if (pasted.length > 0) {
        const newArr = [...resetOtp]
        for (let i = 0; i < 6; i++) {
          newArr[i] = pasted[i] || ''
        }
        setResetOtp(newArr)
        const nextIndex = Math.min(pasted.length, 5)
        otpInputs.current[nextIndex]?.focus()
      }
      return
    }

    const cleanDigit = value.replace(/[^0-9]/g, '')
    const newArr = [...resetOtp]
    newArr[index] = cleanDigit
    setResetOtp(newArr)

    if (cleanDigit && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !resetOtp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  // Forgot Password: Step 2 Submit OTP
  const handleForgotOtpSubmit = (e) => {
    e.preventDefault()
    setForgotError('')
    const entered = resetOtp.join('')
    if (entered.length < 6) {
      setForgotError('Please enter the complete 6-digit OTP code')
      return
    }
    if (entered !== generatedResetOtp) {
      setForgotError(`Invalid OTP. Demo code is: ${generatedResetOtp}`)
      return
    }
    setMode('forgot-new-password')
  }

  const handleResendResetOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedResetOtp(newCode)
    setTimer(45)
    setResetOtp(['', '', '', '', '', ''])
    setForgotError('')
  }

  // Forgot Password: Step 3 Submit New Password
  const handleNewPasswordSubmit = (e) => {
    e.preventDefault()
    setForgotError('')
    if (!newPassword || newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match')
      return
    }
    setMode('forgot-done')
  }

  return (
    <main className="flex-1 w-full bg-[#FAF5EA] flex items-center justify-center py-14 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm max-w-[460px] w-full p-8 sm:p-10 transition-all">
        {/* Brand Logo */}
        <div className="mb-6">
          <button
            onClick={() => setCurrentPage('home')}
            className="p-0 border-0 bg-transparent cursor-pointer inline-block"
            title="Back to Zaika Home"
          >
            <img
              src={zaikaLogo}
              alt="Zaika"
              className="h-9 w-auto object-contain"
            />
          </button>
        </div>

        {/* 1. STANDARD LOGIN */}
        {mode === 'login' && (
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              YOUR TABLE AWAITS
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900 leading-tight">
              Welcome back.
            </h1>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed mb-6">
              Good food tastes even better when you know where to find it.
            </p>

            {loginError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="routhpoulomi@gmail.com"
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-800">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-10 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="mt-2 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email)
                      setForgotError('')
                      setMode('forgot-email')
                    }}
                    className="text-xs text-neutral-500 hover:text-[#85312C] transition-colors cursor-pointer bg-transparent border-0 p-0"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#85312C] hover:bg-[#702622] disabled:opacity-70 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-5"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Log in</span>
                    <span className="text-base leading-none">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 text-center">
              <span className="text-xs text-neutral-500">
                New to Zaika?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentPage('signup')}
                  className="text-[#85312C] font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer text-xs"
                >
                  Sign up
                </button>
              </span>
            </div>
          </div>
        )}

        {/* 2. FORGOT PASSWORD: STEP 1 - ENTER EMAIL */}
        {mode === 'forgot-email' && (
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              RESET PASSWORD
            </span>
            <h1 className="font-serif text-3xl font-normal text-neutral-900 leading-tight">
              Forgot password?
            </h1>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed mb-6">
              Enter your registered email address and we'll send a 6-digit OTP code to verify your identity.
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="routhpoulomi@gmail.com"
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#85312C] hover:bg-[#702622] text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-5"
              >
                <span>Send OTP code</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
              >
                ← Back to log in
              </button>
            </div>
          </div>
        )}

        {/* 3. FORGOT PASSWORD: STEP 2 - OTP VERIFICATION */}
        {mode === 'forgot-otp' && (
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              SECURITY VERIFICATION
            </span>
            <h1 className="font-serif text-3xl font-normal text-neutral-900 leading-tight">
              Enter reset code.
            </h1>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed mb-4">
              We've sent an OTP code to <strong className="text-neutral-800 font-semibold">{resetEmail}</strong>.
            </p>

            {/* Test Helper Demo Badge */}
            <div className="mb-5 p-2.5 rounded-lg bg-[#FAF4DC] border border-[#EDE3C4] flex items-center justify-between text-xs text-neutral-700">
              <span>Demo OTP: <strong className="font-mono font-bold text-[#85312C] text-sm tracking-wider">{generatedResetOtp}</strong></span>
              <button
                type="button"
                onClick={() => {
                  const digits = generatedResetOtp.split('')
                  setResetOtp(digits)
                }}
                className="text-[#85312C] font-semibold underline hover:text-[#702622] cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotOtpSubmit} className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                {resetOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-13 text-center text-xl font-bold font-mono border border-neutral-300 rounded-lg text-neutral-900 outline-none focus:border-[#85312C] focus:ring-2 focus:ring-[#85312C]/20 transition-all bg-white"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                {isResendActive ? (
                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    className="text-[#85312C] font-semibold hover:underline cursor-pointer"
                  >
                    Resend OTP code
                  </button>
                ) : (
                  <span className="text-neutral-400 font-normal">
                    Resend code in <strong className="text-neutral-700">{timer}s</strong>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setMode('forgot-email')}
                  className="text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                >
                  Change email
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#85312C] hover:bg-[#702622] text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-4"
              >
                <span>Verify code</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>
          </div>
        )}

        {/* 4. FORGOT PASSWORD: STEP 3 - NEW PASSWORD */}
        {mode === 'forgot-new-password' && (
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              NEW CREDENTIALS
            </span>
            <h1 className="font-serif text-3xl font-normal text-neutral-900 leading-tight">
              Set new password.
            </h1>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed mb-6">
              Create a new secure password for your Zaika account.
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-10 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 text-xs"
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#85312C] hover:bg-[#702622] text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-6"
              >
                <span>Update password</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>
          </div>
        )}

        {/* 5. FORGOT PASSWORD: STEP 4 - DONE */}
        {mode === 'forgot-done' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              PASSWORD RESET
            </span>
            <h1 className="font-serif text-3xl font-normal text-neutral-900 leading-tight">
              Password updated!
            </h1>
            <p className="text-neutral-600 text-sm mt-2 leading-relaxed mb-6">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>

            <button
              onClick={() => {
                setPassword('')
                setMode('login')
              }}
              className="w-full bg-[#85312C] hover:bg-[#702622] text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>Log in now</span>
              <span className="text-base leading-none">→</span>
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
