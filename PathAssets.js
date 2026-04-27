const path = require("path");

const images = {
  bauWoe: path.join(__dirname, "assets", "images", "bauWoe.jpg"),
  haeh: path.join(__dirname, "assets", "images", "haeh.jpg"),
  defaultPFP: path.join(__dirname, "assets", "images", "defaultPFP.png"),
};

const videos = {
  bauRun: path.join(__dirname, "assets", "videos", "bauRun.mp4"),
  bauThrow: path.join(__dirname, "assets", "videos", "bauThrow.mp4"),
  baubau: path.join(__dirname, "assets", "videos", "baubau.mp4"),
  bauSync: path.join(__dirname, "assets", "videos", "bauSync.mp4"),
  fubuBau: path.join(__dirname, "assets", "videos", "fubuBau.mp4"),
};

const gifs = {
  youreSoBauBau: path.join(__dirname, "assets", "gifs", "youreSoBauBau.gif"),
  mccoe: path.join(__dirname, "assets", "gifs", "mccoe.gif"),
  mccoe2: path.join(__dirname, "assets", "gifs", "mccoe2.gif"),
  mccoe3: path.join(__dirname, "assets", "gifs", "mccoe3.gif"),
  mccoe4: path.join(__dirname, "assets", "gifs", "mccoe4.gif"),
  mccoe5: path.join(__dirname, "assets", "gifs", "mccoe5.gif"),
  mccoe6: path.join(__dirname, "assets", "gifs", "mccoe6.gif"),
  mccoeGrinder: path.join(__dirname, "assets", "gifs", "mccoeGrinder.gif"),
  mccoeTomorrow: path.join(__dirname, "assets", "gifs", "mccoeTomorrow.gif"),
  fww: path.join(__dirname, "assets", "gifs", "fww.gif"),
  fwmcZoom: path.join(__dirname, "assets", "gifs", "fwmcZoom.gif"),
  fwwSpelling: path.join(__dirname, "assets", "gifs", "fwwSpelling.gif"),
  fwwMid: path.join(__dirname, "assets", "gifs", "fwwMid.gif"),
  fwwBackseat: path.join(__dirname, "assets", "gifs", "fwwBackseat.gif"),
  fwwXIV: path.join(__dirname, "assets", "gifs", "fwwXIV.gif"),
  sybau: path.join(__dirname, "assets", "gifs", "sybau.gif"),
  fwmcDog: path.join(__dirname, "assets", "gifs", "fwmcDog.gif"),
  fwmcJerma: path.join(__dirname, "assets", "gifs", "fwmcJerma.gif"),
};

const getAssetCounts = () => {
  return {
    imagesCount: Object.keys(images).length,
    videosCount: Object.keys(videos).length,
    gifsCount: Object.keys(gifs).length,
  };
};

const assets = {
  images,
  videos,
  gifs,
  getAssetCounts,
};

module.exports = assets;
