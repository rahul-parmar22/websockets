import { useEffect, useRef, useState } from "react";


function Counter({ end, play }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!play) {
      setCount(0);
      return;
    }

    let start = 0;
    setCount(0);

    const interval = setInterval(() => {
      start += end / 50;

      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(interval);
  }, [play, end]);

  return <span>{count}</span>;
}



export default function Animation() {
  const ref = useRef();
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          // 👇 only when 60% section visible
          setPlay(true);
        } else {
          setPlay(false); // reset when fully out
        }
      },
      {
        threshold: 0.6, // 🔥 important (not tiny scroll)
      }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div>

      <div className="h-screen flex items-center justify-center">
        <h1 className="text-4xl">Scroll Down 👇</h1>
      </div>

      <div
        className="bg-fixed bg-cover bg-center py-32"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
        }}
      >
        <div
          ref={ref}
          className="bg-black/60 py-20 flex justify-around text-white text-center"
        >
          <div>
            <h2 className="text-5xl font-bold">
              <Counter end={500} play={play} />
            </h2>
            <p>Products</p>
          </div>

          <div>
            <h2 className="text-5xl font-bold">
              <Counter end={1200} play={play} />
            </h2>
            <p>Users</p>
          </div>

          <div>
            <h2 className="text-5xl font-bold">
              <Counter end={10} play={play} />+
            </h2>
            <p>Experience</p>
          </div>
        </div>
      </div>

      <div className="h-screen flex items-center justify-center">
        <h1 className="text-4xl">Next Section 🚀</h1>
      </div>

    </div>
  );
}