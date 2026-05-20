import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import SettingsDropdown from '@site/src/components/SettingsDropdown';

export default function NavbarWrapper(props) {
  return (
    <>
      <OriginalNavbar {...props} />
      <div
        style={{
          position: 'fixed',
          top: '0',
          right: '24px',
          height: '60px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <SettingsDropdown />
      </div>
    </>
  );
}
