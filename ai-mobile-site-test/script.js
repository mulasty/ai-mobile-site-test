const button = document.getElementById("btn");
const message = document.getElementById("msg");

button.addEventListener("click", () => {
  message.textContent = "Dziala JavaScript.";
});
