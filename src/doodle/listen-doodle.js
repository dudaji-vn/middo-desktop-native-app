class Doodle {
  constructor() {
    this.doodle = [];
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
    const index = this.doodle.findIndex((d) => d?.user?._id === user?._id);
    if (index !== -1) {
      this.doodle[index].image = image;
    } else {
      this.doodle.push({ image, user });
    }
    this.updateImageList({ image, user });
  }

  updateImageList({ image, user }) {
    let oldImage = document.querySelector(`[data-id="${user._id}"]`);
    const index = this.doodle.findIndex((d) => d.user._id === user._id);
    if (index && this.doodle[index].timer) {
      clearTimeout(this.doodle[index].timer);
    }
    // if(image == this.doodle[index].image) return;

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
    }, 20000);

    this.doodle[index].timer = timer;
  }

  init() {
    this.listenEvent();
  }
}
new Doodle();
