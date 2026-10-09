import { useState, useRef, useEffect } from 'react'
import zaikaLogo from '../assets/zaika.png'
import { registerUser } from '../services/auth'

export default function SignupPage({ setCurrentPage, onSignupSuccess }) {
  // Step: 1 = Name & Email, 2 = OTP, 3 = Password, 4 = Success
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('482910')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(45)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isResendActive = timer === 0

  const otpInputs = useRef([])

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  // Step 1: Submit Name & Email
  const handleDetailsSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    // Generate simulated 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(newOtp)
    setTimer(45)
    setOtp(['', '', '', '', '', ''])
    setStep(2)
  }

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Paste support
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6)
      if (pasted.length > 0) {
        const newOtp = [...otp]
        for (let i = 0; i < 6; i++) {
          newOtp[i] = pasted[i] || ''
        }
        setOtp(newOtp)
        const nextIndex = Math.min(pasted.length, 5)
        otpInputs.current[nextIndex]?.focus()
      }
      return
    }

    const cleanDigit = value.replace(/[^0-9]/g, '')
    const newOtp = [...otp]
    newOtp[index] = cleanDigit
    setOtp(newOtp)

    if (cleanDigit && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  // Step 2: Submit OTP
  const handleOtpSubmit = (e) => {
    e.preventDefault()
    setError('')
    const enteredOtp = otp.join('')
    if (enteredOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code')
      return
    }
    if (enteredOtp !== generatedOtp) {
      setError(`Invalid OTP. Please enter the code: ${generatedOtp}`)
      return
    }
    setStep(3)
  }

  // Resend OTP
  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(newOtp)
    setTimer(45)
    setOtp(['', '', '', '', '', ''])
    setError('')
  }

  // Step 3: Submit Password & Register User via HTTP-Only Cookies
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
      onSignupSuccess(data.user)
      setStep(4)
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1 w-full bg-[#FAF5EA] flex items-center justify-center py-14 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm max-w-[460px] w-full p-8 sm:p-10 transition-all">
        {/* Logo */}
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

        {/* STEP 1: Name and Email */}
        {step === 1 && (
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              YOUR TABLE AWAITS
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900 leading-tight">
              Join the table.
            </h1>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed mb-6">
              Good food tastes even better when you know where to find it.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                  required
                />
              </div>

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

              <button
                type="submit"
                className="w-full bg-[#85312C] hover:bg-[#702622] text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-6"
              >
                <span>Continue to OTP verification</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>

            <div className="mt-7 text-center">
              <span className="text-xs text-neutral-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentPage('login')}
                  className="text-[#85312C] font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer text-xs"
                >
                  Log in
                </button>
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              EMAIL VERIFICATION
            </span>
            <h1 className="font-serif text-3xl font-normal text-neutral-900 leading-tight">
              Verify your email.
            </h1>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed mb-4">
              We've sent a 6-digit verification code to{' '}
              <strong className="text-neutral-800 font-semibold">{email}</strong>.
            </p>

            {/* Test Helper Demo Badge */}
            <div className="mb-5 p-2.5 rounded-lg bg-[#FAF4DC] border border-[#EDE3C4] flex items-center justify-between text-xs text-neutral-700">
              <span>Demo OTP: <strong className="font-mono font-bold text-[#85312C] text-sm tracking-wider">{generatedOtp}</strong></span>
              <button
                type="button"
                onClick={() => {
                  const digits = generatedOtp.split('')
                  setOtp(digits)
                }}
                className="text-[#85312C] font-semibold underline hover:text-[#702622] cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                {otp.map((digit, idx) => (
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
                    onClick={handleResendOtp}
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
                  onClick={() => setStep(1)}
                  className="text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                >
                  Change email
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#85312C] hover:bg-[#702622] text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-4"
              >
                <span>Verify & proceed to password</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Password Page */}
        {step === 3 && (
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              SECURE YOUR ACCOUNT
            </span>
            <h1 className="font-serif text-3xl font-normal text-neutral-900 leading-tight">
              Create your password.
            </h1>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed mb-6">
              Pick a secure password to protect your Zaika account.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Password
                </label>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#85312C] hover:bg-[#702622] disabled:opacity-70 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-6"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <span className="text-base leading-none">→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: Success / Signed Up */}
        {step === 4 && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              WELCOME ABOARD
            </span>
            <h1 className="font-serif text-3xl font-normal text-neutral-900 leading-tight">
              You're all signed up!
            </h1>
            <p className="text-neutral-600 text-sm mt-2 leading-relaxed mb-6">
              Welcome, <strong className="text-neutral-900">{name}</strong>. Your account has been verified and created. You can now discover places, compare menus, and save your favorites.
            </p>

            <button
              onClick={() => setCurrentPage('home')}
              className="w-full bg-[#85312C] hover:bg-[#702622] text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>Start exploring Zaika</span>
              <span className="text-base leading-none">→</span>
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
