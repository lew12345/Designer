/* Password gate for protected project pages.
   This is a courtesy lock for a static site: it keeps casual visitors and search
   engines out, but the page source is still public. Loaded synchronously in <head>
   so locked content never flashes. The <html> element starts with class="locked". */
(function () {
  "use strict";
  var HASH = "5a7bf3c888827c46f70a30baa09cab3303126a1c4a16ce39c2ae80bf5f60f3f0"; // sha256 of the password
  var KEY = "mills-access";
  var doc = document.documentElement;

  try { if (sessionStorage.getItem(KEY) === HASH) doc.classList.remove("locked"); } catch (e) { /* storage blocked: stay locked */ }

  function sha256(text) {
    var bytes = new TextEncoder().encode(text);
    return crypto.subtle.digest("SHA-256", bytes).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var gate = document.querySelector(".gate");
    if (!gate) return;
    var form = gate.querySelector("form");
    var input = gate.querySelector("input");
    var error = gate.querySelector(".gate__error");
    if (doc.classList.contains("locked")) input.focus();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!window.crypto || !crypto.subtle) { error.textContent = "Please open this page over https to unlock it."; return; }
      sha256(input.value.trim()).then(function (h) {
        if (h === HASH) {
          try { sessionStorage.setItem(KEY, HASH); } catch (err) { /* unlock for this view only */ }
          doc.classList.remove("locked");
          window.scrollTo(0, 0);
          if (window.ScrollTrigger) ScrollTrigger.refresh();
          var main = document.getElementById("main");
          if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
        } else {
          error.textContent = "That password is not right. Please try again.";
          gate.classList.remove("shake"); void gate.offsetWidth; gate.classList.add("shake");
          input.select();
        }
      });
    });
  });
})();
