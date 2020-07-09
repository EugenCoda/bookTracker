function swapText() {
  let shortText = document.getElementById("shortText");
  let fullText = document.getElementById("fullText");

  if (shortText.style.display === "inline") {
    shortText.style.display = "none";
    fullText.style.display = "inline";
  } else {
    shortText.style.display = "inline";
    fullText.style.display = "none";
  }
}
