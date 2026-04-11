import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-bold text-white text-lg font-urdu mb-2">منڈی</p>
          <p className="text-xs text-neutral-400">Pakistan&apos;s marketplace for animals &amp; agriculture</p>
        </div>
        <div>
          <p className="font-semibold text-white text-sm mb-3">Browse</p>
          <ul className="space-y-1 text-sm">
            <li><Link href="/listings" className="hover:text-white transition-colors">All Listings</Link></li>
            <li><Link href="/listings?category=goats" className="hover:text-white transition-colors">Goats</Link></li>
            <li><Link href="/listings?category=cows" className="hover:text-white transition-colors">Cows</Link></li>
            <li><Link href="/listings?category=tractors" className="hover:text-white transition-colors">Tractors</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white text-sm mb-3">Account</p>
          <ul className="space-y-1 text-sm">
            <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            <li><Link href="/listings/new" className="hover:text-white transition-colors">Post an Ad</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white text-sm mb-3">اردو</p>
          <ul className="space-y-1 text-sm font-urdu">
            <li><Link href="/" className="hover:text-white transition-colors">ہوم</Link></li>
            <li><Link href="/listings" className="hover:text-white transition-colors">تمام اشتہارات</Link></li>
            <li><Link href="/listings/new" className="hover:text-white transition-colors">اشتہار دیں</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-700 text-center py-4 text-xs text-neutral-500">
        © {new Date().getFullYear()} Mandi. All rights reserved.
      </div>
    </footer>
  )
}
