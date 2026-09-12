import Image from "next/image";
import type { ArtVariant } from "@/data/patterns";

const artBoards: Record<ArtVariant, string[]> = {
  deer: [],
  dragon: [
    "....yy......", "...yrry.....", "..rrrogg....", ".rrogggbb...", "..oggbbpp...", "...ggbbp....",
    "....bbp..g..", "...bbbb.ggg.", "..bbbggggg..", ".bbb..gg....", "bb....ggg...", "b......gg...",
  ],
  phoenix: [
    ".....rr.....", "....ryr.....", "...rryrr....", "..rrryrrr...", ".rrrkykrrr..", "..rrryrr....",
    "...ryry.....", "..ryy.yy....", ".ryy...yy...", "ryy.....yy..", ".y.......y..", "............",
  ],
  fox: [
    "..oo....oo..", ".ooy....yoo.", ".oyyyyyyyyyo.", "..yyyyyyyy..", "..yyk..kyy..", "..yyyyyyyy..",
    "...ywwwwy...", "....wkkw....", "....yyyy....", "...yy..yy...", "..yy....yy..", "............",
  ],
  flower: [
    ".....rr.....", "....rrrr....", "..rrryrrr...", ".rrryyyrrrr.", "..rrryrrr...", "....rrrr....",
    ".....gg.....", "....ggg.....", "...ggggg....", ".....ggg....", ".....gg.....", "............",
  ],
  moth: [
    "yy........yy", ".yyy....yyy.", ".ypyy..yypy.", "..yyy..yyy..", "...yykkyy...", "....kkkk....",
    "...ggkkgg...", "..ggg..ggg..", ".ggg....ggg.", "gg........gg", "............", "............",
  ],
  berry: [
    ".....gg.....", "...ggggg....", "....ggg.....", "...rrrrr....", "..rrrrrrr...", ".rrrrrrrrr..",
    ".rrwrrrrrr..", ".rrrrrrwrr..", "..rrrrrrr...", "...rrrrr....", "....rrr.....", "............",
  ],
  mushroom: [
    "....rrrr....", "..rrrrrrrr..", ".rrwrrrwrrr.", "rrrrrrrrrrrr", "rrrwrrrrwrrr", ".rrrrrrrrrr.",
    "...wwwwww...", "....wwww....", "....wkkw....", "....wwww....", "...wwwwww...", "............",
  ],
  dinosaur: [
    ".........gg.", "........gggg", ".ggggggggggg", "gggggggggg..", "gggkggggg...", ".gggggggg....",
    "..gggggg....", "...gg.gg....", "...gg..gg...", "..gg...gg...", "............", "............",
  ],
  lantern: [
    "....yyyy....", "...yyyyyy...", "....kkkk....", "..rrrrrrrr..", ".rrrrrrrrrr.", ".rrryyyyrrr.",
    ".rrrrrrrrrr.", "..rrrrrrrr..", "....yyyy....", "....yyyy....", ".....yy.....", "............",
  ],
};

export function PatternVisual({ art, image, priority = false, label }: { art: ArtVariant; image?: string; priority?: boolean; label: string }) {
  if (image) {
    return (
      <div className="pattern-visual pattern-visual--image">
        <Image src={image} alt={label} fill sizes="(max-width: 720px) 90vw, 520px" priority={priority} unoptimized />
      </div>
    );
  }

  return (
    <div className={`pattern-visual pattern-visual--${art}`} role="img" aria-label={`${label} mosaic preview`}>
      <div className="pixel-board">
        {artBoards[art].flatMap((row, y) => [...row].map((cell, x) => (
          <i className={cell === "." ? "pixel-cell" : `pixel-cell pixel-cell--${cell}`} key={`${x}-${y}`} />
        )))}
      </div>
    </div>
  );
}
