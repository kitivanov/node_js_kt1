const zmq = require("zeromq");

async function runServer() {
  const sock = new zmq.Dealer();
  await sock.bind("tcp://127.0.0.1:3000");
  console.log("Готов к игре...");

  let min, max;
  let guess;

  for await (const [msg] of sock) {
    const data = JSON.parse(msg.toString());
    console.log("Сообщение от клиента:", data);

    if (data.range) {
      // получает диапазон
      [min, max] = data.range.split("-").map(Number);
      guess = Math.floor((min + max) / 2);
      await sock.send(JSON.stringify({ answer: guess }));
    } else if (data.hint) {
      if (data.hint === "more") {
        min = guess + 1;
      } else if (data.hint === "less") {
        max = guess - 1;
      }
      guess = Math.floor((min + max) / 2);
      await sock.send(JSON.stringify({ answer: guess }));
    }
  }
}

runServer();