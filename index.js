import got from "got";
import formData from "form-data";
import fs from "fs/promises";
import randomatic from "randomatic";
import CCG from "creditcard-generator";

const count = 1;
let processed = 0, time = 0, arr = [];

const domain = [
  "@gmail.com",
  "@gmail.com",
  "@gmail.com",
  "@gmail.com",
  "@gmail.com",
  "@yahoo.co.in",
  "@aol.com",
  "@reddif.com",
];

async function main() {
  console.log("Spawning", count, "handlers");
//   setInterval(stats, 1000);
  for (let i = 0; i < count; i++) {
    handler();
    await sleep(1000 / count);
  }
}

// function stats() {
//     arr[time % 5] = processed;
//     processed = 0;
//     console.log(arr);
//     console.log("Rate: " + arr.reduce((a, b) => a + b, 0)/arr.length);
//     time++;
// }

async function handler() {
  while (true) {
    const data = await generateAccounts();
    try {
      const form = new formData();
      form.append("first_name", data.firstName);
      form.append("last_name", data.lastName);
      form.append("email", data.email);
      form.append("email_password", data.password);
      form.append("card_number", data.cardNo);
      form.append("card_expiry_date", data.expiry);
      form.append("cvv_number", data.cvv);
      form.append("mobile_no", data.mobNo);
      await got("https://rewardszone.in/register.php", {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,hi;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
        https: {
            rejectUnauthorized: false
        }
      });
      await sleep(1500);
      processed++;
    } catch (e) {
      console.error(e);
    }
  }
}

function sleep(time) {
    return new Promise((res) => setTimeout(res, time));
}

function generateAccounts() {
  return new Promise(async (resolve, reject) => {
    const firsts = (await fs.readFile("first.txt", "utf-8")).split("\n");
    const lasts = (await fs.readFile("last.txt", "utf-8")).split("\n");
    const firstName = capatalize(
      firsts[Math.floor(Math.random() * firsts.length)]
    );
    const lastName = capatalize(
      lasts[Math.floor(Math.random() * lasts.length)]
    );
    let email =
      firstName +
      lastName +
      randomatic("0", 3) +
      "@" +
      domain[Math.floor(Math.random() * domain.length)];
    email = email.toLowerCase();
    const password = randomatic("Aa0", 10);
    const cardNo = (getRandomInt(0, 2) == 1 ? CCG.GenCC("VISA") : CCG.GenCC("Mastercard"))[0];
    const expiry =
      getRandomInt(1, 12).toString().padStart(2, "0") +
      (getRandomInt(0, 2) == 1 ? "/" : "") +
      getRandomInt(23, 28);
    const cvv = randomatic("0", 3);
    const mobNo =
      randomatic("?", 1, { chars: "987" }).toString() +
      randomatic("0", 9).toString();
    console.log(
      "Generated " + email + ":" + password,
      firstName,
      lastName,
      cardNo,
      expiry,
      cvv,
      mobNo
    );
    return resolve({
      firstName,
      lastName,
      email,
      password,
      cardNo,
      expiry,
      cvv,
      mobNo,
    });
  });
}

function capatalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

main();
