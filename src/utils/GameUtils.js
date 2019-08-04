
export default class GameUtils {
  static genImageObj = (inImgNum, inImgUrl, inLocalImgUrl, inLocalImgFolder, nameNumber) => {
    const count = 500;
    const imageNumber = parseInt(inImgNum, 10);
    let calcImageNumer = parseInt(inImgNum, 10);
    if (calcImageNumer === 0) {
      calcImageNumer = 1;
    }
    const low = parseInt((calcImageNumer - 1) / count, 10) * count + 1;
    const high = parseInt((calcImageNumer - 1) / count, 10) * count + count;
    const imageNumFolder = `${low}-${high}`;
    let imgUrl = inImgUrl;
    if (inLocalImgUrl) {
      imgUrl = `${inLocalImgUrl}/${inLocalImgFolder}`;
    }
    if (imgUrl[imgUrl.length - 1] === '/') {
      imgUrl = imgUrl.substring(0, imgUrl.length - 1);
    }
    const imgUrla = `${imgUrl}/${imageNumFolder}/${imageNumber}a.png`;
    const imgUrlb = `${imgUrl}/${imageNumFolder}/${imageNumber}b.png`;

    let tmpNameNumber = imageNumber;
    if (imageNumber) {
      tmpNameNumber = nameNumber;
    }
    const namea = `${tmpNameNumber}a.png`;
    const nameb = `${tmpNameNumber}b.png`;
    return { a: imgUrla, namea, b: imgUrlb, nameb };
  }

  static lpad = (s, len, chr) => {
    const L = len - s.length
    const C = chr || " ";
    if (L <= 0) return s;
    return new Array(L + 1).join(C) + s;
  }

  static loadGameFromZipFile = async (fileObj) => {
    const jszip = require("jszip");
    const zip = await jszip.loadAsync(fileObj);
    let info = null
    let count = 0;
    zip.forEach((_, file) => {  // 2) print entries
      count++;
      if (count > 1) {
        return;
      }
      const size = file._data.uncompressedSize; // eslint-disable-line no-underscore-dangle
      const crc32 = file._data.crc32; // eslint-disable-line no-underscore-dangle
      const hexCrc32 = GameUtils.lpad((crc32 >>> 0).toString(16), 8, '0'); // eslint-disable-line no-bitwise
      const name = fileObj.name.substring(0, fileObj.name.length - 4);
      info = {
        name,
        size,
        crc32: hexCrc32.toUpperCase(),
      };
    });

    return info;
  }

  static newXmlGameInfo = (config, newInfo) => {
    const obj = {
      duplicateID: 0,
      language: 0,
    };
    Object.keys(config.infos).forEach((key) => {
      if (key === 'romCRC' || key === 'languages') {
        return;
      }
      if (key === 'location' || key === 'language') {
        obj[key] = 0;
        return;
      }
      obj[key] = ' ';
    });
    return Object.assign(obj, newInfo);
  }
};
