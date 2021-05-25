const replaceRegex = /[-/\\^$*+?.()|[\]{}]/g;
export function escapeRegex(string) {
  return string ? string.replace(replaceRegex, "\\$&") : "";
}

export function makeIndex(length = 16) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
/**
 * 解析JWT
 * @param {string} token - 合法的JWT
 */
export function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}
/**
 * 返回dataurl格式的Blob
 * @param {File} blob - Blob文件
 */
function promisifyReadAsDataURL(blob) {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((re, rj) => {
    reader.onload = () => {
      re(reader.result);
    };
    reader.onerror = (err) => rj(err);
  });
}
/**
 * fetch图像并转换为dataurl
 * @param {string} imageURL - 图像url
 */
export async function parseImageAsDataURL(imageURL) {
  if (!imageURL) {
    return undefined;
  }
  return await fetch(imageURL)
    .then((res) => res.blob())
    .then((image) => promisifyReadAsDataURL(image))
    .then((url) => url);
}

export function isHttps() {
  return process.env.REACT_APP_HTTPS === 1;
}
const _address =
  (isHttps() ? "https://" : "http://") + process.env.REACT_APP_BACKEND;
export const BackEnd = Object.create(null);
Object.defineProperty(BackEnd, "address", {
  get() {
    return _address;
  },
  configurable: false,
});

/**
 * 秒转00:00格式
 * @param {number} seconds
 * @returns {string}
 */
export function SecsToTime(seconds) {
  if (typeof seconds !== "number" || !seconds) seconds = 0;
  seconds = Math.round(seconds);
  let h = Math.floor(seconds / 3600);
  seconds %= 3600;
  let m = Math.floor(seconds / 60);
  seconds %= 60;
  let s = seconds % 60;
  h = h > 0 && h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;
  return h === 0 ? `${m}:${s}` : `${h}:${m}:${s}`;
}

export function debounce(func, duration = 50, signal = true) {
  if (typeof duration !== "number" || isNaN(duration) || !isFinite(duration)) {
    throw new Error("delay must be a integer number");
  }
  duration = Number.isInteger(duration) ? duration : Math.floor(duration);
  let id;
  return function (...args) {
    clearTimeout(id);
    // console.log('Debounced callback id: ' + id);
    id = setTimeout(() => {
      if (signal) {
        // console.log('Debounced callback fired, id: ' + id);
        func(...args);
      }
    }, duration);
    return id;
  };
}

/**
 * throttle
 * @param {function} func- 被throttle的函数
 * @param {number} delay- throttle的延迟
 * @returns {function}
 */
export function throttle(func, delay = 50, signal = true) {
  if (typeof delay !== "number" || isNaN(delay) || !isFinite(delay)) {
    throw new Error("delay must be a integer number");
  }
  delay = Number.isInteger(delay) ? delay : Math.floor(delay);

  let seqNum = 0;
  return function (...args) {
    seqNum++;
    return setTimeout(() => {
      if (signal) {
        func(...args);
      }
      seqNum--;
    }, seqNum * delay);
  };
}

export function isOffline() {
  return window.location.pathname === "/songlist/detail/offline";
}

export function parseDate(dateString) {
  const date = new Date(dateString);
  const toNow = Date.now() - date.getTime();
  if (toNow > 86400000) {
    return `${
      date.getMonth() + 1
    }月-${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`;
  } else if (toNow > 3600000) {
    return Math.round(toNow / 3600000) + "小时前";
  } else if (toNow > 60000) {
    return Math.round(toNow / 60000) + "分钟前";
  }
  return "刚刚";
}
export function parseMessageLineDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  let hour = date.getHours();
  hour = hour < 10 ? "0" + hour : hour;
  let minutes = date.getMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;

  if (
    now.getDate() === date.getDate() + 1 ||
    (now.getDate() === 1 && now.getMonth() === date.getMonth() + 1) ||
    (now.getMonth() === 1 && now.getFullYear() === date.getFullYear() + 1)
  ) {
    return `昨天${hour}:${minutes}`;
  } else if (now.toDateString() === date.toDateString()) {
    return `今天${hour}:${minutes}`;
  }
  return `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${hour}:${minutes}`;
}
