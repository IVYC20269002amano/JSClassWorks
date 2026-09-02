document.addEventListener("DOMContentLoaded", () => {
  // 暗号化用エレメント
  const inputEncryptArea = document.getElementById("input-passwd-area");
  inputEncryptArea.setAttribute("aria-checked", "true");
  const toggleEncMask = document.getElementById("toggle-enc-mask");
  const encodedConsole = document.getElementById("encoded-console");
  const encCpBtn = document.getElementById("enc-copy-button");

  const dropArea = document.getElementById("drop-zone");
  const dropTitle = document.getElementById("drop-title");
  const dropHint = document.getElementById("drop-hint");
  const fileInput = document.getElementById("file-input");
  const dropZoneContainer = document.getElementById("drop-zone-container");
  const lockedFileDownload = document.getElementById("locked-file-download");
  const resetEncBtn = document.getElementById("reset-enc-btn");

  // 復号化用エレメント
  const inputDecodeArea = document.getElementById("input-decode-area");
  inputDecodeArea.setAttribute("aria-checked", "true");
  const toggleDecMask = document.getElementById("toggle-dec-mask");
  const decodedConsole = document.getElementById("decoded-console");
  const decCpBtn = document.getElementById("dec-copy-button");

  const decodeDropArea = document.getElementById("decode-drop-zone");
  const decodeDropTitle = document.getElementById("decode-drop-title");
  const decodeDropHint = document.getElementById("decode-drop-hint");
  const decodeFileInput = document.getElementById("decode-file-input");
  const decodeZoneContainer = document.getElementById("decode-zone-container");
  const unlockedFileDownload = document.getElementById(
    "unlocked-file-download",
  );
  const resetDecBtn = document.getElementById("reset-dec-btn");

  const copyNotice = document.getElementById("copyNotice");
  let timerId = null;

  // --- トースト通知機能 ---
  function showNotice(message, isError = false) {
    if (timerId) clearTimeout(timerId);
    copyNotice.textContent = message;
    copyNotice.classList.toggle("is-error", isError);
    copyNotice.classList.add("is-show");

    timerId = setTimeout(() => {
      copyNotice.classList.remove("is-show");
    }, 2500);
  }

  // --- XOR暗号化/復号化関数 ---
  function xorTransform(uint8Array, keyString) {
    const keyBytes = new TextEncoder().encode(keyString);
    if (keyBytes.length === 0) return uint8Array;

    const output = new Uint8Array(uint8Array.length);
    for (let i = 0; i < uint8Array.length; i++) {
      output[i] = uint8Array[i] ^ keyBytes[i % keyBytes.length];
    }
    return output;
  }

  // --- Binary ➔ Base64 変換 (大容量ファイル対応) ---
  function uint8ToBase64(uint8Array) {
    let binary = "";
    const len = uint8Array.byteLength;
    const chunkSize = 0x8000;
    for (let i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        uint8Array.subarray(i, i + chunkSize),
      );
    }
    return btoa(binary);
  }

  // --- パスワードマスク制御 ---
  toggleEncMask.addEventListener("change", () => {
    inputEncryptArea.setAttribute(
      "aria-checked",
      toggleEncMask.checked ? "true" : "false",
    );
  });

  toggleDecMask.addEventListener("change", () => {
    inputDecodeArea.setAttribute(
      "aria-checked",
      toggleDecMask.checked ? "true" : "false",
    );
  });

  // --- フォームリセット処理 ---
  function resetEncryptZone() {
    fileInput.value = "";
    dropTitle.textContent = "ここにファイルをドロップ";
    dropHint.textContent = "またはクリックしてファイルを選択";
    dropZoneContainer.classList.add("is-hidden");
    lockedFileDownload.href = "";
    lockedFileDownload.download = "";
  }

  function resetDecryptZone() {
    decodeFileInput.value = "";
    decodeDropTitle.textContent = ".locked ファイルをドロップ";
    decodeDropHint.textContent = "またはクリックして選択";
    decodeZoneContainer.classList.add("is-hidden");
    unlockedFileDownload.href = "";
    unlockedFileDownload.download = "";
  }

  resetEncBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetEncryptZone();
    showNotice("✔ ファイル選択を解除しました");
  });

  resetDecBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetDecryptZone();
    showNotice("✔ ファイル選択を解除しました");
  });

  // ==================================================
  // 🔒 1. 暗号化処理 (ファイル ➔ .locked)
  // ==================================================
  dropArea.addEventListener("click", (e) => {
    if (e.target.tagName !== "A" && e.target.tagName !== "BUTTON") {
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) processEncryptFile(e.target.files[0]);
  });

  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("is-active");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("is-active");
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("is-active");
    if (event.dataTransfer.files.length > 0) {
      processEncryptFile(event.dataTransfer.files[0]);
    }
  });

  function processEncryptFile(file) {
    const password = inputEncryptArea.value.trim();
    if (!password) {
      showNotice("⚠️先にロック用合言葉を入力してください", true);
      resetEncryptZone();
      return;
    }

    dropTitle.textContent = "ファイルを暗号化中...";
    dropHint.textContent = "処理が完了するまでお待ちください";

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawBytes = new Uint8Array(e.target.result);
        const encryptedBytes = xorTransform(rawBytes, password);
        const base64Body = uint8ToBase64(encryptedBytes);

        const mimeType = file.type || "application/octet-stream";
        const encryptedDataUrl = `data:${mimeType};filename=${encodeURIComponent(file.name)};base64,${base64Body}`;

        const lockedBlob = new Blob([encryptedDataUrl], { type: "text/plain" });
        const lockedFileUrl = URL.createObjectURL(lockedBlob);

        lockedFileDownload.href = lockedFileUrl;
        lockedFileDownload.download = `${file.name}.locked`;
        lockedFileDownload.textContent = `🔒 ${file.name}.locked をダウンロード`;

        dropZoneContainer.classList.remove("is-hidden");
        encodedConsole.textContent = encryptedDataUrl;

        dropTitle.textContent = "ロック完了！";
        dropHint.textContent = "暗号化されたファイルを保存できます";

        showNotice("✔ ファイルのロックに成功しました！");
      } catch (err) {
        console.error(err);
        encodedConsole.textContent = "暗号化処理に失敗しました。";
        showNotice("❌ 暗号化エラーが発生しました", true);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ==================================================
  // 🔓 2. 復号化処理 (.locked ➔ 元ファイル)
  // ==================================================
  decodeDropArea.addEventListener("click", (e) => {
    if (e.target.tagName !== "A" && e.target.tagName !== "BUTTON") {
      decodeFileInput.click();
    }
  });

  decodeFileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) processDecryptFile(e.target.files[0]);
  });

  decodeDropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    decodeDropArea.classList.add("is-active");
  });

  decodeDropArea.addEventListener("dragleave", () => {
    decodeDropArea.classList.remove("is-active");
  });

  decodeDropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    decodeDropArea.classList.remove("is-active");
    if (event.dataTransfer.files.length > 0) {
      processDecryptFile(event.dataTransfer.files[0]);
    }
  });

  function processDecryptFile(file) {
    const password = inputDecodeArea.value.trim();
    if (!password) {
      showNotice("⚠️解除用合言葉を入力してください", true);
      resetDecryptZone();
      return;
    }

    decodeDropTitle.textContent = "ロック解除中...";
    decodeDropHint.textContent = "処理が完了するまでお待ちください";

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const encodedStr = e.target.result.trim();
        const matches = encodedStr.match(
          /^data:([^;]+);(?:filename=([^;]+);)?base64,(.+)$/,
        );

        if (!matches) {
          decodedConsole.textContent =
            "破損しているか、無効な .locked ファイルです。";
          showNotice("❌ データ形式が不正です", true);
          decodeDropTitle.textContent = "解除失敗";
          return;
        }

        const mimeType = matches[1];
        const originalFileName = matches[2]
          ? decodeURIComponent(matches[2])
          : "unlocked_file";
        const base64Data = matches[3];

        const binaryStr = atob(base64Data);
        const encryptedBytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          encryptedBytes[i] = binaryStr.charCodeAt(i);
        }

        const decryptedBytes = xorTransform(encryptedBytes, password);
        const fileBlob = new Blob([decryptedBytes], { type: mimeType });
        const fileUrl = URL.createObjectURL(fileBlob);

        unlockedFileDownload.href = fileUrl;
        unlockedFileDownload.download = originalFileName;
        unlockedFileDownload.textContent = `💾 ${originalFileName} を保存`;

        decodeZoneContainer.classList.remove("is-hidden");
        decodedConsole.textContent = `[復号完了] ファイル名: ${originalFileName}\nMIME形式: ${mimeType} (${decryptedBytes.length} bytes)`;

        decodeDropTitle.textContent = "ロック解除完了！";
        decodeDropHint.textContent = "元ファイルをダウンロードできます";

        showNotice("✔ ロック解除に成功しました！");
      } catch (err) {
        console.error(err);
        decodedConsole.textContent =
          "復号化に失敗しました。合言葉を確認してください。";
        showNotice("❌ 復号化に失敗しました", true);
        decodeDropTitle.textContent = "解除失敗";
      }
    };
    reader.readAsText(file);
  }

  // --- クリップボードコピー処理 ---
  encCpBtn.addEventListener("click", async () => {
    const clipLog = encodedConsole.textContent;
    if (!clipLog) {
      showNotice("⚠️コピーする暗号ログがありません", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(clipLog);
      showNotice("✔ 暗号ログをコピーしました！");
    } catch (err) {
      showNotice("❌ コピーに失敗しました", true);
    }
  });

  decCpBtn.addEventListener("click", async () => {
    const clipLog = decodedConsole.textContent;
    if (!clipLog) {
      showNotice("⚠️コピーするログがありません", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(clipLog);
      showNotice("✔ 解除ログをコピーしました！");
    } catch (err) {
      showNotice("❌ コピーに失敗しました", true);
    }
  });
});
