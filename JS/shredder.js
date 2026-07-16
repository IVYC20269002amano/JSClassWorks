document.addEventListener("DOMContentLoaded", () => {
  // ページを更新した時に初期化する（今後使う定数を定義する）
  const targetFile = document.getElementById("targetFile");
  const shredBtn = document.getElementById("shredBtn");

  // シュレッダー実行ボタンがクリックされた時のイベント
  shredBtn.addEventListener("click", () => {
    // INPUTからユーザーが選んだ実際のファイルデータを固定する
    const file = targetFile.files[0];
    // インスタンス化
    const tmpSuperReader = new FileReader();

    // ファイル選択の読込が終わった時のために予約する
    tmpSuperReader.addEventListener("load", () => {
      const fileLength = tmpSuperReader.result.byteLength;
      const inputArrayBuffer = new Uint8Array(tmpSuperReader.result);
      /*console.log(
              inputArrayBuffer[0],
              inputArrayBuffer[1],
              inputArrayBuffer[2],
            );*/
      const randomArray = new Uint8Array(fileLength);
      window.crypto.getRandomValues(randomArray);
      for (let i = 0; i < fileLength; i++) {
        inputArrayBuffer[i] = randomArray[i];
      }
      /*console.log(
              inputArrayBuffer[0],
              inputArrayBuffer[1],
              inputArrayBuffer[2],
            );*/
      //console.log("バイトの全データを乱数で破壊しました");

      const elememtaryBlob = new Blob([inputArrayBuffer], {
        type: file.type,
      });

      const tmpDownloadUrl = URL.createObjectURL(elememtaryBlob);
      const hiddenLink = document.createElement("a");
      hiddenLink.href = tmpDownloadUrl;
      hiddenLink.download = file.name;
      hiddenLink.click();
    });
    tmpSuperReader.readAsArrayBuffer(file);
  });
});
