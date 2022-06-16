console.log("test.js here");
let originalFunction = window.Storage.prototype.setItem;
window.Storage.prototype.setItem = function (keyName, keyValue) {
  // console.log(new Error().stack);
  console.log("keyName", keyName);
  originalFunction.apply(this, arguments);
  return;
};
