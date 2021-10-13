//import "./dashboard.css";

import { MASK_DETECTION, PERSON_DETECTION, RECOGNIZE } from "../../endpoints";

import Grid from "@material-ui/core/Grid";
//import FaceCard from "../../components/cards/face_card";
import MediaCard from "../../components/cards/face_card";
//import MediaCard from "../../components/card1";

import React from "react";
import face from "../../assets/images/cards/recognition.jpeg";
import mask from "../../assets/images/cards/mask-detection.jpg";
import person from "../../assets/images/cards/person-detection.png";

export default function Dashboard({ setSelectedMode }) {
  return (
    <div className="dashboard-container">
      <Grid container spacing={4} justify="center">
        <Grid item>
          <div onClick={() => setSelectedMode(MASK_DETECTION)}>
            <MediaCard img={mask} title={"Mask Detection"}></MediaCard>
          </div>
        </Grid>
        <Grid item>
          <div onClick={() => setSelectedMode(PERSON_DETECTION)}>
            <MediaCard img={person} title={"Person Detection"}></MediaCard>
          </div>
        </Grid>
        <Grid item>
          <div onClick={() => setSelectedMode(RECOGNIZE)}>
            <MediaCard img={face} title={"Face Recognition"}></MediaCard>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
