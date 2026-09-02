document.addEventListener("DOMContentLoaded", () => {
  const resultDiv = document.getElementById("result");
  const genBtn = document.getElementById("genBtn");
  const passRange = document.getElementById("passRange");

  const charactersLower = "abcdefghijklmnopqrstuvwxyz"; // 文字プール
  const charactersUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersDigit = "0123456789";
  const charactersSymbol = "?!#$%&@^`~|_:;.,<>[]{}()+-*/\\";

  passRange.addEventListener("input", () => {
    genBtn.textContent = parseInt(passRange.value, 10) + "文字生成";
  });

  genBtn.addEventListener("click", () => {
    const hasUpper = document.getElementById("hasUpper");
    const hasDigit = document.getElementById("hasDigit");
    const hasSymbol = document.getElementById("hasSymbol");

    // 0. ボタンを押すと、表示されている文字をクリアする
    resultDiv.innerHTML = "";
    // 毎回大文字のみで初期化する
    // 一時的なものは入力、出力用に最初にわかりやすい言葉を付けること
    let tmpCharacters = charactersLower;
    // 実際に生成する文字数を固定する
    const passLength = parseInt(passRange.value, 10);
    // 大文字を含めるかどうかの判定
    if (hasUpper.checked) {
      tmpCharacters += charactersUpper;
    }
    // 数字を含めるかどうかの判定
    if (hasDigit.checked) {
      tmpCharacters += charactersDigit;
    }
    // 記号を含めるかどうかの判定
    if (hasSymbol.checked) {
      tmpCharacters += charactersSymbol;
    }
    const characters = tmpCharacters;

    for (let j = 0; j < 6; j++) {
      // 0. 渡すためのラベルを用意する
      let tmpPassword = "";
      // 1. 安全な乱数をステータスバー分用意する (0〜255)
      const randomArray = new Uint8Array(passLength);
      window.crypto.getRandomValues(randomArray);
      for (let i = 0; i < passLength; i++) {
        // 2. 文字プールの長さ（26文字）で割った余りを出して、
        // 0〜25のインデックスに変換
        const randomIndex = randomArray[i] % characters.length;
        tmpPassword += characters[randomIndex];
      }

      if (j < 5) {
        // 新しい<input>要素をメモリの中に作り出す
        const inputEl = document.createElement("input");
        inputEl.type = "text";
        inputEl.readOnly = true;
        inputEl.value = tmpPassword;

        // 3. 画面に表示
        // 出力されるテキストボックスの大きさが文字数に連動する
        inputEl.style.width = `${passLength * 1.3}ch`;
        // 横幅を広げる、整型する,
        inputEl.style.maxWidth = "100%";
        inputEl.style.boxSizing = "border-box";
        // inline要素をブロック要素に変換
        inputEl.style.display = "block";
        resultDiv.appendChild(inputEl);

        tmpPassword = "";
        randomArray.fill(0);
      } else {
        // ラストにわざと変数内に残すダミーを作る
        // 新しい<input>要素をメモリの中に作り出す
        const inputEl = document.createElement("input");
        inputEl.type = "text";
        inputEl.readOnly = true;
        inputEl.value = tmpPassword;
      }
    }
  });
});
