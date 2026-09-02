document.addEventListener("DOMContentLoaded", () => {
  /* ==================================================
     1. ランダム・重複可能なシャッフル演出 (Baffle.js カスタム)
     ================================================== */
  if (typeof baffle !== "undefined") {
    // 1. Baffleの文字選出ロジックを「重複可能な完全ランダム」に書き換え
    baffle.prototype.random = function () {
      const chars = this.options.characters;
      // 配列/文字列から重複を許容してランダムに1文字抽出
      return chars[Math.floor(Math.random() * chars.length)];
    };

    // シャッフル対象の文字セット（記号や英数字を混ぜてサイバー感を強調）
    const charPool =
      "█▓▒░/\\=+#*:<>{}" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const DURATION = 800; // 演出の総時間（ミリ秒）: お好みで調整してください
    const SPEED = 30; // 切り替わりの速さ（ミリ秒）: 小さいほど高速

    // A. 巨大h1の各行（span.hero-line）に対するアニメーション
    const heroLines = document.querySelectorAll(".hero-line");
    heroLines.forEach((line) => {
      const b = baffle(line, {
        characters: charPool,
        speed: SPEED,
      });

      // スロットのように高速で完全ランダムに文字をシャッフルし続ける
      b.start();

      // 指定時間（DURATION）が経過してから元の正解テキストへ徐々に復元開始
      setTimeout(() => {
        b.reveal(800); // 最後の0.8秒でピタッと元の文字に揃える
      }, DURATION);
    });

    // B. その他の通常テキスト（.scramble-text）に対するアニメーション
    const otherScramble = baffle(".scramble-text", {
      characters: charPool,
      speed: SPEED,
    });
    otherScramble.start();
    setTimeout(() => {
      otherScramble.reveal(800);
    }, DURATION);
  }

  /* ==================================================
     2. スクロール切り替え演出 (GSAP + ScrollTrigger)
     ================================================== */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    window.addEventListener("load", () => {
      ScrollTrigger.refresh();
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero-title-section",
        start: "top top",
        end: "+=150%",
        scrub: 0.8,
        pin: true,
      },
    });

    tl.to(".hero-title", {
      opacity: 0,
      scale: 0.7,
      filter: "blur(12px)",
      ease: "power1.out",
    }).to(
      "#main-content-wrapper",
      {
        opacity: 1,
        y: 0,
        ease: "power1.out",
      },
      "-=0.3",
    );
  }
});
