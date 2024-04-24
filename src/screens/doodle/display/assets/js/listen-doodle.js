class Doodle {
  constructor() {
    this.doodle = new WeakMap();
    this.init();
  }

  listenEvent() {
    if (ipcRenderer) {
      ipcRenderer.on("SEND_DOODLE_SHARE_SCREEN", (data) => {
        this.handleSendDoodleShareScreen(data);
      });
    }
  }

  handleSendDoodleShareScreen(data) {
    const { image, user } = data;
    if (this.doodle.has(user)) {
      this.doodle.set(user, { image, user });
    } else {
      this.doodle.set(user, { image, user });
    }
    this.updateImageList({ image, user });
  }

  updateImageList({ image, user }) {
    let oldImage = document.querySelector(`[data-id="${user._id}"]`);
    if (oldImage) {
      oldImage.src = image;
    } else {
      const imageList = document.querySelector(".image-list");
      let img = document.createElement("img");
      img.src = image;
      img.alt = '';
      img.setAttribute("data-id", user._id);
      imageList.appendChild(img);
      img.onerror = () => {
        img.remove();
      };
    }

    const timer = setTimeout(() => {
      let oldImage = document.querySelector(`[data-id="${user._id}"]`);
      if (oldImage) {
        oldImage.remove();
      }
      this.doodle.delete(user);
    }, 20000);

    this.doodle.set(user, { image, user, timer });
  }

  init() {
    this.listenEvent();
  }
}
new Doodle();
