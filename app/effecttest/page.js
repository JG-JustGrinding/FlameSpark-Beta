"use client";
import React from "react";
import "./page.css";

export default function EffectsCatalogue() {
  return (
    <div className="catalogue">
      <h1>Animation Effects Catalogue</h1>

      {/* Laser Beam */}
      <div className="effect-box laser-container">
        <div className="laser-beam"></div>
        <p className="effect-text">Laser Beam</p>
      </div>

      {/* Glowing Pulse */}
      <div className="effect-box pulse-container">
        <p className="effect-text">Glowing Pulse</p>
      </div>

      {/* Gradient Sweep */}
      <div className="effect-box gradient-container">
        <p className="effect-text">Gradient Sweep</p>
      </div>

      {/* Shaking Box */}
      <div className="effect-box shake-container">
        <p className="effect-text">Shaking Box</p>
      </div>
    </div>
  );
}