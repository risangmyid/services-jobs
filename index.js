const cac = require("cac").default();

cac.option("--port <port>", "HTTP Port");
cac.help();

const option = cac.parse();

if (!option?.options?.port) {
  throw new Error("Port Tidak ada");
}

const http = require("http");
const router = require("find-my-way")();
const { Heap } = require("heap-js");
const { CronExpressionParser } = require("cron-parser");
const PQueue = require("p-queue").default;

const queue = new PQueue({
  concurrency: 5,
});

const heap = new Heap((a, b) => a.time - b.time);

const getWaktu = (cron, options) => {
  const interval = CronExpressionParser.parse(cron, {
    currentDate: options.curr || new Date(),
    tz: "Asia/Jakarta",
  });

  return new Date(interval.next().toString());
};

const olahRequest = (dt) => {
  if (!dt?.waktu && !dt?.cron) return false;

  const add = {};
};

router.on("POST", "/add", async (req, reply) => {
  const res = req.body;

  if (Array.isArray(res)) {
    for (let a of res) {
      const add = {
        id: a.id,
        time: new Date(a.tgl),
        url: a?.url,
      };

      heap.push(add);
    }
  } else {
    const add = {
      id: res.id,
      time: new Date(res.tgl),
    };

    heap.push(add);
  }

  reply.setHeader("Content-Type", "application/json");
  reply.end(JSON.stringify(res));
});

const server = new http.createServer(async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    req.body = body ? JSON.parse(body) : {};

    router.lookup(req, res);
  });
});

server.listen(option?.options?.port, "0.0.0.0", (err, addr) => {
  console.log("Server", addr, err);
});

const proses = (job) => {
  console.log(job);

  if (job?.url) {
    queue.add(() => {
      fetch(job?.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
      }).catch((e) => {
        console.log("gagal");
      });
    });
  }
};

setInterval(() => {
  const wkt = new Date();

  while (heap.length > 0 && heap.peek().time <= wkt) {
    const job = heap.pop();

    proses(job);
  }
}, 1000);
