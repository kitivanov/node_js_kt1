const zmq = require("zeromq");

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Использование: node client.js MIN MAX");
  process.exit(1);
}

const MIN = parseInt(args[0]);
const MAX = parseInt(args[1]);

// загаданное число
const secret = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
console.log(`Загадано число: ${secret}`);

async function runClient() {
  const sock = new zmq.Dealer();
  await sock.connect("tcp://127.0.0.1:3000");

  // диапазон для серверу
  await sock.send(JSON.stringify({ range: `${MIN}-${MAX}` }));

  for await (const [msg] of sock) {
    const data = JSON.parse(msg.toString());
    console.log("Сервер предлагает:", data);

    if (data.answer !== undefined) {
      let hint;
      if (data.answer < secret) {
        hint = "more";
      } else if (data.answer > secret) {
        hint = "less";
      } else {
        console.log("Сервер угадал число!");
        process.exit(0);
      }
      await sock.send(JSON.stringify({ hint }));
    }
  }
}

runClient();