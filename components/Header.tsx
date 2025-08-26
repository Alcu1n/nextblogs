'use client';

import classNames from 'classnames';
import headerNavLinks from 'content/headerNavLinks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { ScrollContext } from './Providers/ScrollProvider';
import CommandPalette from './CommandPalette/CommandPalette';
import MobileNav from './MobileNav';
import ThemeSwitch from './ThemeSwitch';
import Image from 'next/image';

export default function Header() {
  const pathName = usePathname();
  const { scrollY } = useContext(ScrollContext);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // 当滚动超过 30px 时触发效果
    const scrolled = scrollY > 30;
    setIsScrolled(scrolled);
    console.log('Scroll Y:', scrollY, 'Is scrolled:', scrolled);
  }, [scrollY]);

  // 获取当前主题
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={classNames(
        // 基础样式和固定定位 - 确保在ShaderBackground之上
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-out',
        // 内边距
        'py-4 md:py-6',
        // 滚动后的效果
        {
          // 强化背景色，确保有明显的半透明背景
          'bg-white/90 dark:bg-gray-900/90': isScrolled,
          // 边框效果
          'border-b border-gray-200/60 dark:border-gray-700/60': isScrolled,
          // 阴影效果
          'shadow-xl shadow-black/10 dark:shadow-black/25': isScrolled,
          // 添加backdrop-blur类作为备用
          'backdrop-blur-xl': isScrolled,
        }
      )}
      style={{
        // 强化backdrop-filter效果
        backdropFilter: isScrolled ? 'blur(24px) saturate(200%) brightness(1.05)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(200%) brightness(1.05)' : 'none',
        // 确保有背景色作为fallback
        backgroundColor: isScrolled
          ? isDark
            ? 'rgba(17, 24, 39, 0.9)'
            : 'rgba(255, 255, 255, 0.9)'
          : 'transparent',
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <Link
            href="/"
            className={classNames('horizontal-underline text-3xl font-extrabold', {
              'horizontal-underline-active': pathName === '/',
            })}
            aria-label="L ."
          >
            <Image
              src="/L_logo.svg"
              alt="L logo"
              width={38}
              height={38}
              className="opacity-80 transition-opacity duration-300 hover:opacity-100"
            />
          </Link>
        </div>
        <div className="flex items-center space-x-3 text-base leading-5">
          <div className="hidden space-x-5 sm:flex">
            {headerNavLinks.map(({ title, href }) => {
              const active = pathName?.includes(href);
              return (
                <Link
                  prefetch
                  key={title}
                  href={href}
                  className={classNames(
                    'horizontal-underline text-base transition-all duration-300',
                    {
                      'horizontal-underline-active': active,
                    },
                    // 滚动后的文字颜色调整
                    {
                      'text-gray-900 dark:text-gray-100': isScrolled,
                      'text-gray-700 dark:text-gray-300': !isScrolled,
                    }
                  )}
                  aria-label={title}
                >
                  <span
                    className={classNames(
                      'font-semibold tracking-wide transition-all duration-300',
                      {
                        'text-gray-900 dark:text-gray-100': isScrolled,
                        'text-gray-700 dark:text-gray-300': !isScrolled,
                      }
                    )}
                  >
                    {title}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center space-x-2">
            <CommandPalette />
            <ThemeSwitch />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
