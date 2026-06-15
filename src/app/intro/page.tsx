'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntroCarousel() {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const handleScroll = () => {
      const index = Math.round(carousel.scrollLeft / carousel.offsetWidth);
      setActiveIndex(index);
    };
    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSlide = (index: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * carouselRef.current.offsetWidth,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < 2) {
      scrollToSlide(activeIndex + 1);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-background font-body-md min-h-screen flex flex-col">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface-container-lowest">
        <h1 className="text-xl font-bold text-primary">SpendWise</h1>
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-on-surface-variant font-medium"
        >
          Skip
        </button>
      </header>

      <main className="flex-1 flex flex-col pt-20 pb-8">

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto flex-1 touch-pan-x snap-x snap-mandatory scroll-smooth hide-scrollbar"
          style={{ scrollbarWidth: 'none' }}
        >

          {/* Slide 1 */}
          <section className="flex-none w-full flex flex-col items-center justify-center px-6 snap-start">
            <div className="bg-surface-container-low rounded-[40px] p-8 w-full max-w-sm flex flex-col items-center justify-center relative shadow-sm border border-surface-variant/30 overflow-hidden">
              <div className="absolute top-4 right-6 text-4xl">💰</div>
              <div className="w-full h-48 mb-6 rounded-2xl overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  alt="Financial dashboard"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAUqNZMe86I1_X6rAU71AP89E1ZQj7rDSLC0OS-He5uVlwEKCKvn__U4gh87U7MH4kZEmmZ2o_BvFWc2Vxz0tR6xKX4gNjpwfYXmI19wsHZWAs850zmcqyPyCSH2F9CCLYF5Gly_lSWqowEs3tpHAjwfotI63VMJEeb8ohQ7F3YWCtnjOUFlKS4scZBQ27q3R02gXvIfK2DKMoP_rxChGLenuKk5-sn0f01wo00ms9iozeR6lQSzeXS4lZfFtx8oDq8UKtS2nkvOse"
                />
              </div>
              <h2 className="text-center text-on-surface text-xl font-bold">
                Track every Rs without the stress
              </h2>
              <p className="text-on-surface-variant text-center mt-4 text-sm">
                See where your money goes automatically, every day.
              </p>
            </div>
          </section>

          {/* Slide 2 */}
          <section className="flex-none w-full flex flex-col items-center justify-center px-6 snap-start">
            <div className="bg-surface-container-low rounded-[40px] p-8 w-full max-w-sm flex flex-col items-center justify-center relative shadow-sm border border-surface-variant/30 overflow-hidden">
              <div className="absolute top-4 right-6 text-4xl">🔥</div>
              <div className="w-full h-48 mb-6 rounded-2xl overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  alt="Savings goals"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfpXjB4NmR-veSi1rllxEsIKc3soKl6H0-er8SOCrZnTWsk9mlKVmJwUudYchuWbrIC-jyVWdSubz9Cx6xwY3_c52FeN4H8Ho3xTu2FFY9LpQRnUBkjwQcxWcpbnuX29oDAxzo1D3RLf80xC74TJLv9ivrPel91MokO5izkcMaohafCaXVxicZ_zX4hwIG5RqnVsQb67svZF_5t72VuK66aXY91mSKt7fZhCWep8scyGAmWrvpAAq1WuF-eWWR5x_WMO6eMORhKiT8"
                />
              </div>
              <h2 className="text-center text-on-surface text-xl font-bold">
                Save for what you love
              </h2>
              <p className="text-on-surface-variant text-center mt-4 text-sm">
                Set savings goals for travel, gadgets, or anything you want.
              </p>
            </div>
          </section>

          {/* Slide 3 */}
          <section className="flex-none w-full flex flex-col items-center justify-center px-6 snap-start">
            <div className="bg-surface-container-low rounded-[40px] p-8 w-full max-w-sm flex flex-col items-center justify-center relative shadow-sm border border-surface-variant/30 overflow-hidden">
              <div className="absolute top-4 right-6 text-4xl">🧠</div>
              <div className="w-full h-48 mb-6 rounded-2xl overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  alt="AI insights"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA84USEWEwS0W7oh0eJBMiKq4bQlGTN-MTCo0bbZSMddmiUhz_NVId4-x_kUn4iz53UEdUUr-xYM4uGZ57u9m1oylWNaXRLa-uqhsnpZFAq89ve-HamMJFnLf8phkcwTiB1NgSUlL7NkPFNShfNv8zdoXEjFblxgaBI8k_C-1MZvJq8jHjnAHYX9jBLJxqMNsXSI460a-txE1NO_k13aO-UVuPLQqC9oRDEpDcaiQWWiW_9M1mvmLvTHsmGl_2TVYs3kAuHgJ8kgEby"
                />
              </div>
              <h2 className="text-center text-on-surface text-xl font-bold">
                AI tips that actually help
              </h2>
              <p className="text-on-surface-variant text-center mt-4 text-sm">
                Personalized insights to grow your savings without the boring lectures.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="px-6 flex flex-col items-center gap-5 mt-6">

          {/* Dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => scrollToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'bg-primary w-6' : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="w-full max-w-md flex flex-col gap-3">
            <button
              onClick={handleNext}
              className="w-full py-4 px-8 bg-primary text-white font-bold rounded-full active:scale-95 transition"
            >
              {activeIndex < 2 ? 'Next' : 'Get Started'}
            </button>

            <button
              onClick={() => router.push('/login')}
              className="w-full py-2 text-primary font-medium active:scale-95 transition"
            >
              I already have an account
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}