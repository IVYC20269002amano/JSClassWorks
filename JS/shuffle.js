/**
 * Zero-Trust Shield - 全要素・placeholder対応 安全版シャッフル演出
 */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof baffle === "undefined") return;

  // 1. Baffleのランダム抽出ロジックを上書き（重複あり・完全ランダム化）
  baffle.prototype.random = function () {
    const chars = this.options.characters;
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // ★ご指定のパラメータに設定
  const CHAR_POOL = "█▓▒░/\\=+#*:<>{}" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const DURATION = 900; // シャッフル演出時間（0.9秒）
  const SPEED = 25; // 文字切り替え速度（25ミリ秒の高速スロット）

  // --------------------------------------------------
  // A. 通常のテキスト要素（divを含む）の安全シャッフル
  // --------------------------------------------------
  const selector = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "span",
    "a",
    "label",
    "button",
    "div",
    "legend",
    "td",
    "th",
    "li",
    ".badge",
    ".scramble-text",
    ".hero-line",
  ].join(",");

  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    // 【バグ防止 1】子要素にHTMLタグ（buttonやinput等）を持っているdiv等は除外[cite: 16, 17, 18, 21]
    if (element.children.length > 0) return;

    // 【バグ防止 2】テキストが空、または空白のみの要素はスキップ[cite: 16, 17, 18, 21]
    const text = element.textContent.trim();
    if (!text) return;

    // 【バグ防止 3】scriptやstyleタグはスキップ
    const tagName = element.tagName.toLowerCase();
    if (tagName === "script" || tagName === "style") return;

    // Baffleの適用
    const b = baffle(element, {
      characters: CHAR_POOL,
      speed: SPEED,
    });

    b.start();

    // 0.9秒後に元の正解テキストへ一気に揃える
    setTimeout(() => {
      b.reveal(400); // 着地時間をスピーディーに調整（400ms）
    }, DURATION);
  });

  // --------------------------------------------------
  // B. input / textarea の placeholder 専用シャッフル
  // --------------------------------------------------
  const inputsWithPlaceholder = document.querySelectorAll(
    "input[placeholder], textarea[placeholder]",
  );

  inputsWithPlaceholder.forEach((input) => {
    const originalPlaceholder = input.getAttribute("placeholder"); //[cite: 16, 17, 18, 21]
    if (!originalPlaceholder) return;

    const length = originalPlaceholder.length;

    // 高速で文字をシャッフルするタイマー
    const intervalId = setInterval(() => {
      let randomText = "";
      for (let i = 0; i < length; i++) {
        randomText += CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
      }
      input.setAttribute("placeholder", randomText);
    }, SPEED);

    // 0.9秒後に元のplaceholderへ戻す
    setTimeout(() => {
      clearInterval(intervalId);
      input.setAttribute("placeholder", originalPlaceholder);
    }, DURATION);
  });
});
