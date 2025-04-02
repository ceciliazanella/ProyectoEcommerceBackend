function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.style.backgroundColor = type === "success" ? "green" : "red";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

window.showNotification = showNotification;
