document.addEventListener("DOMContentLoaded", () => {
  const inputEncryptArea = document.getElementById("input-passwd-area");
  inputEncryptArea.setAttribute("aria-checked", "true");
  const toggleEncMask = document.getElementById("toggle-enc-mask");
  const encryptBtn = document.getElementById("encrypt-button");

  const encodedConsole = document.getElementById("encoded-console");
  const encCpBtn = document.getElementById("enc-copy-button");

  const inputDecodeArea = document.getElementById("input-decode-area");
  inputDecodeArea.setAttribute("aria-checked", "true");
  const toggleDecMask = document.getElementById("toggle-dec-mask");
  const decodeBtn = document.getElementById("decode-button");

  const decodedConsole = document.getElementById("decoded-console");
  const decCpBtn = document.getElementById("dec-copy-button");

  // --- パスワードマスク制御 ---
  toggleEncMask.addEventListener("change", () => {
    if (toggleEncMask.checked) {
      inputEncryptArea.setAttribute("aria-checked", "true");
    } else {
      inputEncryptArea.setAttribute("aria-checked", "false");
    }
  });

  toggleDecMask.addEventListener("change", () => {
    if (toggleDecMask.checked) {
      inputDecodeArea.setAttribute("aria-checked", "true");
    } else {
      inputDecodeArea.setAttribute("aria-checked", "false");
    }
  });

  // --- テキストの暗号化（Base64化） ---
  encryptBtn.addEventListener("click", () => {
    const secretStr = inputEncryptArea.value;
    const utf8Str = new TextEncoder().encode(secretStr);
    const binaryStr = String.fromCodePoint(...utf8Str);
    const encodedStr = btoa(binaryStr);
    encodedConsole.innerHTML = encodedStr;
  });

  // --- テキストの復号化（Base64解除） ---
  decodeBtn.addEventListener("click", () => {
    const encodedStr = inputDecodeArea.value.trim();
    if (!encodedStr) {
      decodedConsole.textContent = "復号化するデータが入力されていません。";
      return;
    }

    try {
      // 構成Aはテキスト専用のため、単純にBase64をデコードして文字列に戻します
      const binaryStr = atob(encodedStr);
      const utf8Str = Uint8Array.from(binaryStr, (char) => char.charCodeAt(0));
      const decodedStr = new TextDecoder().decode(utf8Str);
      decodedConsole.innerHTML = decodedStr;
    } catch (err) {
      decodedConsole.textContent =
        "復号化に失敗しました。正しい暗号データを入力してください。";
      console.error(err);
    }
  });

  // --- コピーボタンの動作 ---
  encCpBtn.addEventListener("click", async () => {
    try {
      const clipLog = encodedConsole.innerHTML;
      await navigator.clipboard.writeText(clipLog);
      encodedConsole.innerHTML = "ClipBoardにCopy完了！";
    } catch (err) {
      console.error("Copy失敗！");
    }
  });

  decCpBtn.addEventListener("click", async () => {
    try {
      const clipLog = decodedConsole.innerHTML;
      await navigator.clipboard.writeText(clipLog);
      decodedConsole.innerHTML = "ClipBoardにCopy完了！";
    } catch (err) {
      console.error("Copy失敗！");
    }
  });
});
