
export default class GameUtils {
  static genImageObj = (inImgNum, inImgUrl, inLocalImgUrl, inLocalImgFolder) => {
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
    const namea = `${imageNumber}a.png`;
    const nameb = `${imageNumber}b.png`;
    return { a: imgUrla, namea, b: imgUrlb, nameb };
  }
};
