import React from "react";
import OriginalNavbar from "@theme-original/Navbar";
import ColorPicker from "@site/src/components/ColorPicker";

export default function Navbar(props) {
  return (
    <div style={{position:"relative"}}>
      <OriginalNavbar {...props} />
      <div style={{
        position:"absolute",
        right:"160px",
        top:"0",
        height:"100%",
        display:"flex",
        alignItems:"center",
        zIndex:9999,
      }}>
        <ColorPicker />
      </div>
    </div>
  );
}
