

document.body.addEventListener(
  "click",
  (event) => {
    if (
      event.target.tagName === "A" &&
      event.target.getAttribute("target") === "_blank"
    ) {
      event.preventDefault();
      let url = event.target.getAttribute("href");
      electron.openInBrowser(url);
    }
  },
  true
);

