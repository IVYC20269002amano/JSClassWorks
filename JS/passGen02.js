// スライダーと表示数値の連動

document.addEventListener("DOMContentLoaded", () => {
  const resultDiv = document.getElementById("result");
  const genBtn = document.getElementById("genBtn");
  const copyBtn = document.getElementById("copyBtn");
  const copyNotice = document.getElementById("copyNotice");
  const passRange = document.getElementById("passRange");
  const rangeValue = document.getElementById("rangeValue");

  const hasUpper = document.getElementById("hasUpper");
  const hasDigit = document.getElementById("hasDigit");
  const hasSymbol = document.getElementById("hasSymbol");

  const CHAR_SETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digit: "0123456789",
    symbol: "!" + '"' + "?#$%&@^`~|_:;.,<>[\\]{}()+-*/",
  };

  let timerId = null;

  // 記号に対する例外処理
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // 画面内通知を自動で消去する関数
  function showNotice(message, isError = false) {
    if (timerId) clearTimeout(timerId);

    copyNotice.textContent = message;
    copyNotice.classList.toggle("is-error", isError);
    copyNotice.classList.add("is-show");

    timerId = setTimeout(() => {
      copyNotice.classList.remove("is-show");
    }, 1500);
  }

  passRange.addEventListener("input", (e) => {
    const len = e.target.value;
    rangeValue.textContent = len;
    genBtn.textContent = `${len}文字生成`;
  });

  // 1つの文字列が指定されたカテゴリ条件をすべて満たしているかチェックする関数
  function isValidPassword(password, activeCategories) {
    return activeCategories.every((categoryStr) => {
      // カテゴリに含まれる文字がパスワード内に1文字以上存在するか判定
      for (let i = 0; i < password.length; i++) {
        if (categoryStr.includes(password[i])) {
          return true;
        }
      }
      return false;
    });
  }

  // チェックを100%パスするまでループして単一のパスワードを生成する関数
  function generateSingleValidatedPassword(passLength, activeCategories) {
    const combinedPool = activeCategories.join("");

    // 安全な文字選択のためのバイアス排除用上限値設定
    const poolLength = combinedPool.length;
    const maxValidByte = 256 - (256 % poolLength);

    while (true) {
      let tmpPassword = "";
      const randomArray = new Uint8Array(passLength * 2); // 念のため多めに取得
      window.crypto.getRandomValues(randomArray);

      let byteIndex = 0;
      while (tmpPassword.length < passLength) {
        if (byteIndex >= randomArray.length) {
          window.crypto.getRandomValues(randomArray);
          byteIndex = 0;
        }
        const randByte = randomArray[byteIndex++];

        // 偏りを防ぎ確実に均等な確率で文字を抽出
        if (randByte < maxValidByte) {
          tmpPassword += combinedPool[randByte % poolLength];
        }
      }

      // チェックを通った場合のみ返却
      if (isValidPassword(tmpPassword, activeCategories)) {
        return tmpPassword;
      }
    }
  }

  genBtn.addEventListener("click", () => {
    const activeCategories = [CHAR_SETS.lower];
    if (hasUpper.checked) activeCategories.push(CHAR_SETS.upper);
    if (hasDigit.checked) activeCategories.push(CHAR_SETS.digit);
    if (hasSymbol.checked) activeCategories.push(CHAR_SETS.symbol);

    const passLength = parseInt(passRange.value, 10);

    // 文字数が選択されたカテゴリ数より少ない場合は警告して中断
    if (passLength < activeCategories.length) {
      showNotice("⚠️文字数が選択されたカテゴリ数より短すぎます", true);
      return;
    }

    resultDiv.innerHTML = "";

    // 厳格なチェックを通った合格品のみを5つ生成
    for (let j = 0; j < 5; j++) {
      const password = generateSingleValidatedPassword(
        passLength,
        activeCategories,
      );
      const radioId = `pass_option_${j}`;

      const safePasswordHTML = escapeHTML(password);

      const row = document.createElement("div");
      row.className = "pass-radio-row";
      row.style.cssText =
        "display: flex; align-items: center; gap: 10px; margin-bottom: 8px; text-align: left;";
      row.innerHTML = `
        <input type="radio" name="passwordSelect" id="${radioId}" value="${safePasswordHTML}" ${
          j === 0 ? "checked" : ""
        }>
        <label for="${radioId}" style="font-family: var(--font-mono); font-size: 0.9rem; word-break: break-all; cursor: pointer;">
          ${safePasswordHTML}
        </label>
      `;

      resultDiv.appendChild(row);
    }
  });

  // コピーボタンの処理関数
  copyBtn.addEventListener("click", () => {
    const selectedRadio = document.querySelector(
      'input[name="passwordSelect"]:checked',
    );

    if (!selectedRadio) {
      showNotice("⚠️コピーするパスワードを選択して下さい", true);
      return;
    }

    const parser = new DOMParser();
    const decodedValue = parser.parseFromString(
      selectedRadio.value,
      "text/html",
    ).body.textContent;

    navigator.clipboard
      .writeText(selectedRadio.value)
      .then(() => {
        showNotice("✔クリップボードにコピーしました！");
      })
      .catch((err) => {
        console.error("コピー失敗:", err);
        showNotice("❌️コピーに失敗しました", true);
      });
  });
});
