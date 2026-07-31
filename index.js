const cac = require("cac").default();

cac.option("--port <port>", "HTTP Port");
cac.help();

const option = cac.parse();

if (!option?.options?.port) {
  throw new Error("Port Tidak ada");
}

const fs = require("fs");

const http = require("http");
const router = require("find-my-way")();
const { Heap } = require("heap-js");
const { CronExpressionParser } = require("cron-parser");
const PQueue = require("p-queue").default;

const queue = new PQueue({
  concurrency: 5,
});

const heap = new Heap((a, b) => a.date - b.date);
const heapJobs = new Map();

const createId = () => {
  return (
    Math.random().toString(16).substring(2) + Date.now().toString(16)
  ).toUpperCase();
};

const getWaktu = (cron, options) => {
  const interval = CronExpressionParser.parse(cron, {
    currentDate: options.curr || new Date(),
    tz: "Asia/Jakarta",
  });

  return new Date(interval.next().toString());
};

const olahRequest = (dt, lama) => {
  if (!dt?.date && !dt?.cron) {
    return {
      ok: false,
      message: "Date atau Cron Kosong",
      data: dt,
    };
  }

  const add = {};

  let wkt = new Date();
  let prev;

  if (dt?.date) {
    let tgl = new Date(dt?.date);

    if (!isNaN(tgl) && tgl > wkt) {
      wkt = tgl;
    }

    if (!isNaN(tgl)) {
      prev = tgl;
    }
  }

  if (dt.cron) {
    wkt = getWaktu(dt.cron, {
      currentDate: wkt,
      tz: dt?.timezone || "",
    });
  }

  const id = !lama ? createId() : dt._id;

  Object.assign(add, dt, {
    _id: id,
    date: wkt,
    prev: prev,
  });

  heap.push(add);
  heapJobs.set(id, add);

  return {
    ok: true,
    id: id,
    message: "Success",
    data: add,
  };
};

if (fs.existsSync("jobs.json")) {
  try {
    const data = JSON.parse(fs.readFileSync("jobs.json", "utf8"));

    for (let d of data) {
      olahRequest(d, true);
    }
  } catch (error) {
    console.log("Gagal Load Jobs", error.message);
  }
}

router.on("GET", "/", async (req, reply) => {
  reply.setHeader("Content-Type", "application/json");
  reply.end(JSON.stringify(heap.toArray()));
});

router.on("POST", "/add", async (req, reply) => {
  const res = req.body;
  const rep = [];

  if (Array.isArray(res)) {
    for (let a of res) {
      rep.push(olahRequest(a));
    }
  } else {
    rep.push(olahRequest(res));
  }

  reply.setHeader("Content-Type", "application/json");
  reply.end(JSON.stringify(rep));
});

router.on("DELETE", "/:id", async (req, reply, params) => {
  const { id } = params;

  heapJobs.delete(id);
  reply.end(id);
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
  if (job?.cron) {
    job.date = "";
    olahRequest(job);
  }

  if (job?.url) {
    queue.add(() => {
      console.log("kirim", job?.url);
      const controller = new AbortController();

      setTimeout(() => controller.abort(), 1000);

      fetch(job?.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
        signal: controller.signal,
      }).catch((e) => {
        console.log("gagal");
      });
    });
  }
};

const saveHeap = () => {
  try {
    fs.writeFileSync("jobs.json", JSON.stringify(heap.toArray(), null, 2));
    console.log("Heap berhasil disimpan.");
  } catch (err) {
    console.error("Gagal menyimpan heap:", err);
  }
};

setInterval(() => {
  const wkt = new Date();

  if (heap.length > 0) {
    while (heap.length > 0 && heap.peek().date <= wkt) {
      const job = heap.pop();

      if (heapJobs.has(job._id || "")) {
        proses(job);
      }
    }
  }
}, 1000);

process.on("SIGINT", () => {
  console.log("SIGINT");
  saveHeap();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  saveHeap();
  process.exit(0);
});
