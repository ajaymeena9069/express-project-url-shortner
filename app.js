import express from "express";
import { PORT } from "./env.js";
import path from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const DATA_FILE = path.join(__dirname, "data", "link.json");

const loadLink = async () => {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    if (!data.trim()) {
      await writeFile(DATA_FILE, JSON.stringify({}), "utf-8");
      return {};
    }
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(DATA_FILE, JSON.stringify({}), "utf-8");
      return {};
    }
    throw error;
  }
};

const generateRandomCode = () => {
  return crypto.randomBytes(4).toString("hex");
};

app.get("/", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "view", "index.html");
    let urlData = await readFile(filePath, "utf-8");
    const links = await loadLink();

    const linksHtml = Object.entries(links)
      .map(([shortCode, url], index) => {
        return `
    <p>
      <a href="/${shortCode}" target="_blank">${const linksHtml = Object.entries(links)
  .map(([shortCode, url], index) => {
    return `
      <div class="link-item">
        <span class="short-url">
          <a href="/${shortCode}" target="_blank">${req.headers.host}/${shortCode}</a>
        </span>
        <span class="arrow">→</span>
        <span class="long-url">
          <a href="${url}" target="_blank">${url}</a>
        </span>
      </div>
    `;
  })
  .join("");

          req.headers.host
        }/${shortCode}</a>
      &nbsp; - &nbsp; ${url}
    </p>
  `;
      })
      .join("");

    urlData = urlData.replace("{{short_urls}}", linksHtml);
    res.send(urlData);
  } catch (err) {
    console.error("Error reading index.html:", err);
    res.status(500).send("Error loading page");
  }
});

app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;
  const links = await loadLink();
  if (links[shortCode]) {
    let url = links[shortCode];
    res.redirect(url);
  } else {
    res
      .status(404)
      .send("<h1>404 Not Found</h1><p>Short URL does not exist.</p>");
  }
});

app.post("/shorten", async (req, res) => {
  const { "long-url": url, "short-url": shortCode } = req.body;
  const links = await loadLink();

  if (!url || url.trim() === "") {
    return res.redirect("/?error=1");
  }

  const finalCode =
    shortCode && shortCode.trim() !== "" ? shortCode : generateRandomCode();

  if (links[finalCode]) {
    return res.redirect("/?error=2");
  }

  console.log("Received:", url, finalCode);

  links[finalCode] = url;
  await writeFile(DATA_FILE, JSON.stringify(links, null, 2), "utf-8");

  res.redirect("/?success=1");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
