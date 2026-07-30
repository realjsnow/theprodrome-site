(function () {
  function markMissingImage(event) {
    var img = event.currentTarget;
    var frame = img.closest("figure");

    if (!frame) {
      return;
    }

    frame.classList.add("is-missing");
    img.remove();
  }

  document.querySelectorAll("img[data-placeholder]").forEach(function (img) {
    img.addEventListener("error", markMissingImage);

    if (img.complete && img.naturalWidth === 0) {
      markMissingImage({ currentTarget: img });
    }
  });

  var form = document.getElementById("contact-form");

  if (form) {
    var endpoint =
      atob("aHR0cHM6Ly9mb3Jtc3VibWl0LmNvL2FqYXgv") +
      atob("amFzb253YWRlc25vd0BnbWFpbC5jb20=");
    var status = form.querySelector(".contact-status");
    var button = form.querySelector(".contact-send");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      button.disabled = true;
      status.textContent = "Sending...";

      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: form.elements.name.value,
          email: form.elements.email.value,
          message: form.elements.message.value,
          _subject: "Prodrome website inquiry",
          _template: "table",
          _captcha: "false"
        })
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Request failed");
          }

          form.reset();
          status.textContent = "Message sent. Thank you.";
        })
        .catch(function () {
          status.textContent = "Something went wrong. Please try again later.";
        })
        .finally(function () {
          button.disabled = false;
        });
    });
  }
})();
