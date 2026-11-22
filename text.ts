import "./style.css";

const inputTextArea = document.getElementById("inputText") as HTMLTextAreaElement;
const outputTextArea = document.getElementById("outputText") as HTMLTextAreaElement;
const dedupButton = document.getElementById("dedupButton") as HTMLButtonElement;

function removeDuplicateLines(text: string): string {
  const lines = text.split(/\r?\n/);
  const uniqueLines = [...new Set(lines)];
  return uniqueLines.join("\n");
}

function handleDeduplicate() {
  const inputText = inputTextArea.value;
  const dedupText = removeDuplicateLines(inputText);
  outputTextArea.value = dedupText;
}

dedupButton.addEventListener("click", handleDeduplicate);

