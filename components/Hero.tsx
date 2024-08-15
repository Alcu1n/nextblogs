'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactElement, useContext, useEffect, useRef } from 'react';
import { HiOutlineArrowNarrowDown } from 'react-icons/hi';
import { ScrollContext } from './Providers/ScrollProvider';
import SceneCanvas from './Scene/SceneCanvas';

export default function Hero(): ReactElement {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollY } = useContext(ScrollContext);

  let progress = 0;
  const { current: elContainer } = ref;

  if (elContainer) {
    progress = Math.min(1, scrollY / elContainer.clientHeight);
  }

  useEffect(() => {
    // 你之前的renderCanvas逻辑被移除，使用Three.js渲染
  }, []);

  return (
    <div className="relative">
      <div className="relative z-10 flex h-[calc(100vh-81px)] items-center md:h-[calc(100vh-116px)]">
        <div className="mx-auto w-screen max-w-3xl px-4 sm:px-9 xl:max-w-5xl xl:px-0">
          <div className="-mt-36">
            <div ref={ref} className="flex cursor-default flex-col space-y-2">
              <Link
                href="/blog"
                className="underline-magical text-md w-max cursor-pointer sm:text-lg md:text-xl xl:text-2xl absolute bottom-20"
              >
                Read Blogs &rarr;
              </Link>
            </div>
            <motion.div
              animate={{
                transform: `translateY(${progress * 10}vh)`,
              }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 transform md:bottom-8"
            >
              <div
                role="presentation"
                className="flex cursor-pointer flex-col items-center justify-center"
                onClick={() => {
                  const intro = document.querySelector('#intro');
                  intro?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <HiOutlineArrowNarrowDown size={20} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* 将 Canvas 放在最底层 */}
      <div className="absolute inset-0 px-4 sm:px-9 xl:px-0">
        <SceneCanvas />
      </div>
    </div>
  );
}
