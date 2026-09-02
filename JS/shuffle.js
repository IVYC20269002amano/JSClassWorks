/**
 * Zero-Trust Shield - 全要素・placeholder対応 安全版シャッフル演出（フォーム除外版）
 */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof baffle === "undefined") return;

  // 1. Baffleのランダム抽出ロジックを上書き（重複あり・完全ランダム化）
  baffle.prototype.random = function () {
    const chars = this.options.characters;
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // ★パラメータ設定
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
    const tagName = element.tagName.toLowerCase();

    // 【除外ガード 1】フォームコントロール関連タグ、スクリプト、スタイルは除外
    if (
      ["script", "style", "input", "select", "textarea", "option"].includes(
        tagName,
      )
    ) {
      return;
    }

    // 【除外ガード 2】フォーム・スライダー・動的表示エリア内の要素を除外
    if (
      element.closest("input, select, textarea") ||
      element.classList.contains("range-value") ||
      element.classList.contains("range-slider") ||
      element.closest(".slider-item, .control-item, .controls-group")
    ) {
      return;
    }

    // 【バグ防止 1】子要素にHTMLタグ（buttonやinput等）を持っているdiv等は除外
    if (element.children.length > 0) return;

    // 【バグ防止 2】テキストが空、または空白のみの要素はスキップ
    const text = element.textContent.trim();
    if (!text) return;

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
    // スライダー（range）などの特殊なinputはplaceholderシャッフルからも除外
    if (
      input.type === "range" ||
      input.type === "checkbox" ||
      input.type === "radio"
    ) {
      return;
    }

    const originalPlaceholder = input.getAttribute("placeholder");
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
