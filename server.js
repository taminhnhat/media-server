const express = require("express")
const app = express()
const fs = require("fs")
let morgan = require('morgan')
app.use(morgan('combined'))

let videoCollection = ['./media/catherinae.mp4', './media/jurassic world.mp4', './media/gulby.mp4', './media/mini pelia.mp4']
let videoIndex = 0

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.get("/video", function (req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    // get video stats (about 61MB)
    // const videoPath = "media/gulby.mp4";
    console.log(req.query.id)
    const videoPath = videoCollection[req.query.id || 0]
    console.log(`playing video "${videoPath}"`)
    if (videoIndex >= videoCollection.length - 1)
        videoIndex = 0
    else
        videoIndex += 1

    const videoSize = fs.statSync(videoPath).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
});

app.listen(8092, function () {
    console.log(`Listening on http://localhost:8092/`);
});