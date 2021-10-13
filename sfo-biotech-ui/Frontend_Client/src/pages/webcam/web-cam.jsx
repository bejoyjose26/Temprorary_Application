import "./video-stream.css";
import { DataURIToBlob, timeout } from "../../utils/utils";
import { MASK_DETECTION, RECOGNIZE } from "../../endpoints";
import React, { useEffect, useRef, useState } from "react";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Webcam from "react-webcam";
import { makeStyles } from "@material-ui/core";

// const urls = [MASK_DETECTION, PERSON_DETECTION, RECOGNIZE];
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),

    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "300px",
    },
    "& .MuiButtonBase-root": {
      margin: theme.spacing(2),
    },
  },
}));

export const WebcamComponent = ({ selectedMode }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [recognized, setRecognized] = useState(null);
  const drawImge = async () => {
    const video = webcamRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      var ctx = canvas.getContext("2d");
      canvas.width = video.video.videoWidth;
      canvas.height = video.video.videoHeight;
      // We want also the canvas to display de image mirrored
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video.video, 0, 0, canvas.width, canvas.height);
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
  };
  useEffect(() => {
    if (!selectedMode) return;
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    const drawImgeInterval = setInterval(() => {
      drawImge();
    }, 1000);

    const recognizeInterval =
      selectedMode === RECOGNIZE &&
      setInterval(() => {
        if (recognized === null) {
          playing &&
            recognize(canvas, ctx).then((data) => {
              let marks = { ...data[0] };
              ctx.strokeStyle = "green";
              ctx.strokeRect(
                marks[0],
                marks[1],
                marks[2] - marks[0],
                marks[3] - marks[1]
              );
              setRecognized(marks);
            });
        }
        if (recognized) {
          const recognizedAs = `Recognition: ${recognized[4]}`;
          const { x, y } = { x: 5, y: canvas.height - 16 };
          drawTextAt(canvas, ctx, recognizedAs, 14, "red", x, y);
        }
      }, 1000);

    const drawMarkingsInterval =
      selectedMode === MASK_DETECTION &&
      setInterval(async () => {
        if (playing) {
          await drawMarkings(canvas, ctx);
        }
      }, 1000);

    return () => {
      clearInterval(drawMarkingsInterval);
      clearInterval(drawImgeInterval);
      clearInterval(recognizeInterval);
    };
  }, [playing, recognized, selectedMode]);

  const startVideo = () => {
    setPlaying(true);
    // setTimeout(drawImge, 33);
  };
  const stopVideo = () => {
    setPlaying(false);
  };

  return (
    // <Grid justify="center">
      <div className="container">
        <Webcam
          audio={true}
          ref={webcamRef}
          mirrored
          style={{
            width: "0%",
            height: "0%",
          }}
        />
        {/* <Grid > */}
          <canvas
            ref={canvasRef}
            style={{ marginTop: "5px", width: "80%", height: "90%" }}
          />
          <div className="app_input">
            {" "}
            {!playing ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={startVideo}
              >
                Start
              </Button>
            ) : (
              <Button onClick={stopVideo}>Stop</Button>
            )}
          </div>
        {/* </Grid> */}
      </div>
    // {/* </Grid> */}
  );
};

const drawMarkings = async (canvas, ctx) => {
  var img = canvas.toDataURL("image/png");
  const imageFile = DataURIToBlob(img);
  let formData = new FormData();
  formData.append("image", imageFile);
  await Promise.all([
    fetch(MASK_DETECTION, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        let marks = { ...data[0] };
        ctx.strokeStyle = "#FF0000";
        ctx.strokeRect(
          marks[2],
          marks[3],
          marks[4] - marks[2],
          marks[5] - marks[3]
        );
        const { x, y } = { x: 5, y: canvas.height - 36 };

        drawTextAt(canvas, ctx, `Mask Detection: ${marks[6]}`, 14, "red", x, y);
      }),
    timeout(1500),
  ]);
};
const recognize = async (canvas, ctx) => {
  return new Promise((resolve, reject) => {
    var img = canvas.toDataURL("image/png");
    const imageFile = DataURIToBlob(img);
    let formData = new FormData();
    formData.append("image", imageFile);
    formData.append("collection_name", "test_people");

    fetch(RECOGNIZE, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
};
const drawTextAt = (canvas, ctx, string, fontSize, color, x, y) => {
  if (!string) return;
  var i = string.length;
  i = i * fontSize * 0.62;
  if (i > canvas.width) {
    i = canvas.width;
  }
  ctx.fillStyle = "RGBA(255, 255, 255, 0.8)";
  ctx.fillRect(x, y - (fontSize * 1.5) / 2, i, fontSize * 1.5);
  ctx.font = fontSize.toString() + "px monospace";
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";

  ctx.fillText(string, x, y);
};
