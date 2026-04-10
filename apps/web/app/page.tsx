import { CATEGORIES, MAJOR_CITIES } from '@mandi/config'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">منڈی</h1>
        <p className="text-primary-100 text-lg mb-8">
          پاکستان کی بہترین مارکیٹ — جانور اور زرعی اشیاء خریدیں اور بیچیں
        </p>
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="search"
            placeholder="تلاش کریں..."
            className="flex-1 rounded-lg px-4 py-3 text-neutral-900 text-base"
          />
          <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            تلاش
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-neutral-800">تمام اقسام</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="bg-white rounded-xl p-6 text-center shadow-card hover:shadow-md transition-shadow border border-neutral-100"
            >
              <p className="text-lg font-semibold text-neutral-800">{cat.nameUr}</p>
              <p className="text-sm text-neutral-500 mt-1">{cat.nameEn}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Browse by city */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-neutral-800">شہر کے مطابق تلاش کریں</h2>
          <div className="flex flex-wrap gap-3">
            {MAJOR_CITIES.map((city) => (
              <a
                key={city.id}
                href={`/listings?city=${city.id}`}
                className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                {city.nameUr}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
