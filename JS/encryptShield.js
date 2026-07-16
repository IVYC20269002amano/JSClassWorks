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

  const dropArea = document.getElementById("drop-zone");
  const visibleFile = document.getElementById("visible-file");
  const unvisibleFile = document.getElementById("unvisible-file");

  toggleEncMask.addEventListener("change", () => {
    if (toggleEncMask.checked) {
      inputEncryptArea.setAttribute("aria-checked", true);
    } else {
      inputEncryptArea.setAttribute("aria-checked", false);
    }
  });

  encryptBtn.addEventListener("click", () => {
    //Startボタンを押すと、元の合言葉をbase64でencodeする
    const secretStr = inputEncryptArea.value;
    //console.log(secretStr);
    const utf8Str = new TextEncoder().encode(secretStr);
    const binaryStr = String.fromCodePoint(...utf8Str);
    const encodedStr = btoa(binaryStr);
    encodedConsole.innerHTML = encodedStr;
  });

  encCpBtn.addEventListener("click", async () => {
    try {
      const clipLog = encodedConsole.innerHTML;
      await navigator.clipboard.writeText(clipLog);
      encodedConsole.innerHTML = "";
      encodedConsole.innerHTML = "ClipBoardにCopy完了！";
      //console.log(encodedConsole.innerHTML);
    } catch (err) {
      console.error("Copy失敗！");
    }
  });

  toggleDecMask.addEventListener("change", () => {
    if (toggleDecMask.checked) {
      inputDecodeArea.setAttribute("aria-checked", true);
    } else {
      inputDecodeArea.setAttribute("aria-checked", false);
    }
  });

  decodeBtn.addEventListener("click", () => {
    //Startボタンを押すと、元の合言葉に復号化する
    const encodedStr = inputDecodeArea.value;
    const binaryStr = atob(encodedStr);
    const utf8Str = Uint8Array.from(binaryStr, (char) => char.charCodeAt(0));
    const decodedStr = new TextDecoder().decode(utf8Str);
    decodedConsole.innerHTML = decodedStr;
  });

  decCpBtn.addEventListener("click", async () => {
    try {
      const clipLog = decodedConsole.innerHTML;
      await navigator.clipboard.writeText(clipLog);
      decodedConsole.innerHTML = "";
      decodedConsole.innerHTML = "ClipBoardにCopy完了！";
      //console.log(encodedConsole.innerHTML);
    } catch (err) {
      console.error("Copy失敗！");
    }
  });

  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();

    dropArea.classList.add("is-active");
  });

  dropArea.addEventListener("dragleave", (event) => {
    dropArea.classList.remove("is-active");
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("is-active");

    const file = event.dataTransfer.files[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);

    if (file.type === ("image/*" || "video/*")) {
      visibleFile.src = fileUrl;
      unvisibleFile.classList.add("is-hidden");
      const pElement = dropArea.querySelector("p");
      pElement.textContent = "ファイルを暗号化中...";
    } else {
      unvisibleFile.href = fileUrl;
      visibleFile.classList.add("is-hidden");
      const pElement = dropArea.querySelector("p:last-of-type");
      pElement.textContent = "ファイルを暗号化中...";
    }
  });
});
