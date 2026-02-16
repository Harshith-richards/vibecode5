(() => {
  const mapsAnchor = [...document.querySelectorAll("a[href]")].find((a) =>
    /google\.(com|co\.[a-z]+)\/maps|maps\.google\.com|goo\.gl\/maps/.test(a.href)
  );

  if (!mapsAnchor) return;

  const btn = document.createElement("button");
  btn.textContent = "Open in RidePrompt";
  btn.style.position = "fixed";
  btn.style.bottom = "16px";
  btn.style.right = "16px";
  btn.style.zIndex = "999999";
  btn.style.border = "none";
  btn.style.borderRadius = "999px";
  btn.style.padding = "10px 14px";
  btn.style.background = "#06b6d4";
  btn.style.color = "#0f172a";
  btn.style.fontWeight = "700";

  btn.onclick = () => {
    const shared = encodeURIComponent(mapsAnchor.href);
    window.open(`https://rideprompt.app/?shared=${shared}`, "_blank", "noopener,noreferrer");
  };

  document.body.appendChild(btn);
})();
