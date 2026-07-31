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

  // The Vimeo player costs ~700KB and a fistful of requests, so the cover art
  // stands in until someone actually asks for the trailer.
  var play = document.getElementById("trailer-play");
  var frame = document.getElementById("trailer-frame");

  if (play && frame) {
    play.addEventListener("click", function () {
      var iframe = document.createElement("iframe");

      iframe.title = "Prodrome Movie Trailer";
      iframe.src =
        "https://player.vimeo.com/video/1214477179?h=a312ae3c1b" +
        "&badge=0&autopause=0&title=0&byline=0&portrait=0&autoplay=1";
      iframe.allow =
        "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;

      frame.innerHTML = "";
      frame.appendChild(iframe);
    });
  }

  var btn = document.getElementById("text-btn");

  if (btn) {
    var label = btn.querySelector(".btn-text-label");
    var original = label.textContent;
    var resetTimer = null;

    // Stored as character codes so the number never appears in the page
    // source, where scrapers harvest it with a plain phone-number regex.
    var number = String.fromCharCode.apply(
      null,
      [43, 49, 55, 48, 50, 54, 48, 56, 49, 57, 53, 50]
    );

    btn.setAttribute("href", "sms:" + number);

    // sms: links only resolve on devices with a messaging app registered for
    // the protocol. On desktop the click is silently ignored, so copy the
    // number instead of leaving a dead button.
    function isDesktop() {
      return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }

    function flash(message) {
      label.textContent = message;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        label.textContent = original;
      }, 2000);
    }

    btn.addEventListener("click", function (e) {
      if (!isDesktop()) return; // let the sms: link open Messages on mobile

      e.preventDefault();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(number).then(
          function () { flash("Number copied"); },
          function () { flash("Copy failed"); }
        );
      } else {
        flash("Copy failed");
      }
    });
  }
})();
