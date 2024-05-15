
// Prevent links from opening in the apps 

document.body.addEventListener(
  "click",
  (event) => {
    if (
      event.target.tagName === "A" ||
      event.target.closest("a") !== null
    ) {
      let target = event.target.tagName === "A" ? event.target : event.target.closest("a");
      if (target.getAttribute("target") === "_blank") {
        event.preventDefault();
        let url = target.getAttribute("href");
        electron.openInBrowser(url);
      }
    }
  },
  true
);

