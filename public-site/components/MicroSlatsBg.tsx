"use client";

import MicroSlats from "./MicroSlats/MicroSlats";

/**
 * 全站背景：MicroSlats 微板条波浪（swell 紫色预设，深色底）
 * 固定满屏置于内容之下，layout 层统一挂载
 */
export default function MicroSlatsBg() {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none">
      <MicroSlats
        preset="swell"
        color="#A855F7"
        glintColor="#ffffff"
        backgroundColor="#120f17"
        slatWidth={10}
        slatHeight={25}
        gap={3}
        roundness={0.75}
        interactive
        cursorStrength={1}
        cursorSize={40}
        swirl={0}
        trail={1.4}
        lean={0}
        intro
        scale={1.5}
        speed={0.6}
        direction={250}
        chop={0.55}
        stretch={0}
        glint={0.7}
        contrast={1.25}
        perspective={0.55}
        fog={0.55}
        introDuration={1.5}
        paused={false}
      />
    </div>
  );
}
