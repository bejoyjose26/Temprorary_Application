//import "./dashboard.css";

import { MASK_DETECTION, PERSON_DETECTION, RECOGNIZE } from "../../endpoints";

import Grid from "@material-ui/core/Grid";
import FaceCard from "../../components/cards/face_card";
import MaskCard from "../../components/cards/mask_card";
import PersonCard from "../../components/cards/person_card";
import React from "react";
import mask from "../../assets/images/cards/Mask 3.png";
import person from "../../assets/images/cards/person_card_img.png";
import face from "../../assets/images/cards/face_card_Img.png";

import Particles from 'react-particles-js';
export default function Dashboard({ setSelectedMode }) {
  return (
    <div className="dashboard-container" >
       <Particles
        params={{
          "particles": {
              "number": {
                  "value": 30
              },
              "size": {
                  "value": 3
              },
              "color": {
                "value": ["#383838","#007C7C"]
              },
              "shape": {
                "type": "circle",
                "stroke": {
                  "width": 0,
                  "color": "#b6b2b2"
                }
              },
              "size": {
                "value": 8.017060304327615,
                "random": true,
                "anim": {
                  "enable": true,
                  "speed": 4,
                  "size_min": 0.1,
                  "sync": true
                }
              },
              "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#2E3B55",
                "opacity": 0.5,
                "width": 1
              },
          },
          "interactivity": {
              "events": {
                  "onhover": {
                      "enable": true,
                      "mode": "repulse"
                  }
              }
          }
      }}  className="particle_css" style={{position: 'relative'}}/>

      <Grid container spacing={7} justify="center" style={{position: 'absolute'}}>
        <Grid item>
          <div onClick={() => setSelectedMode(MASK_DETECTION)}>
            {/* <WebcamComponent selectedMode={selectedMode}></WebcamComponent> */}
            <MaskCard img={mask} title={"Person Detection"}></MaskCard> 
            
          </div>
        </Grid>
        <Grid item>

          <div onClick={() => setSelectedMode(PERSON_DETECTION)}>
           <PersonCard img={person} title={"Person Detection"}></PersonCard> 
          </div>
        </Grid>
        <Grid item>
          <div onClick={() => setSelectedMode(RECOGNIZE)}>
            {/* <MediaCard img={face} title={"Face Recognition"}></MediaCard> */}
            <FaceCard img={face} title={"Mask Detection"}></FaceCard>
          </div>
        </Grid>
      </Grid>
      
    </div>
  );
}
