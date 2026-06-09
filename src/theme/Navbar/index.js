import React, { useEffect } from 'react';
import OriginalNavbar from '@theme-original/Navbar';

export default function NavbarWrapper(props) {
  useEffect(() => {
    const html = document.documentElement;
    const sync = () => html.classList.toggle('nav-scrolled', window.scrollY > 10);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, []);

  return <OriginalNavbar {...props} />;
}
