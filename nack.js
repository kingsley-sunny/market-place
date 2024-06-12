const fs = require("fs");
const zlib = require("zlib");
const os = require("os");
const crypto = require("crypto");
const { request } = require("https");

// process.env.UV_THREADPOOL_SIZE = 4;

// const cpuCores = os.cpus();

// console.log(cpuCores);

// const gzip = zlib.createGunzip();

// const readableStream = fs.createReadStream("./nack.zip");

// const writeStream = fs.createWriteStream("./nack.png");

// readableStream.pipe(gzip).pipe(writeStream);

// const MAX_CALLS = 2;

const start = Date.now();
// for (let i = 0; i < MAX_CALLS; i++) {

// }

// crypto.pbkdf2Sync("password", "salt", 100000, 512, "sha512");
// console.log(`Hash ${MAX_CALLS}`, Date.now() - start);

// crypto.pbkdf2("password", "salt", 100000, 512, "sha512", () => {
//   console.log(`Hash ${MAX_CALLS}`, Date.now() - start);
// });

// crypto.pbkdf2("password", "salt", 100000, 512, "sha512", () => {
//   console.log(`Hash ${MAX_CALLS}`, Date.now() - start);
// });

// crypto.pbkdf2("password", "salt", 100000, 512, "sha512", () => {
//   console.log(`Hash ${MAX_CALLS}`, Date.now() - start);
// });

// crypto.pbkdf2("password", "salt", 100000, 512, "sha512", () => {
//   console.log(`Hash ${MAX_CALLS}`, Date.now() - start);
// });

// fs.readFile(__filename, e => console.log("Read a file"));
// setTimeout(() => {
//   console.log("Did Timer Event");
// }, 0);
// Promise.resolve().then(e => console.log("Did promise resolve"));
// process.nextTick(e => console.log("Did process next tick"));

// request("https://www.google.com", data => {
//   console.log(data);
//   console.log(start - Date.now());
// });

// request("https://www.google.com", data => {
//   console.log(start - Date.now());
// });

// request("https://www.google.com", data => {
//   console.log(start - Date.now());
// });
