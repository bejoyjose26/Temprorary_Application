//import "./dashboard.css";

import { MASK_DETECTION, PERSON_DETECTION, RECOGNIZE } from "../../endpoints";

// import Grid from "@material-ui/core/Grid";
// import MediaCard from "../../components/cards/face_card";
import React,{ useState } from "react";
// import face from "../../assets/images/cards/recognition.jpeg";
// import mask from "../../assets/images/cards/AI-4.jpg";
// import person from "../../assets/images/cards/person-detection.png";
// import Particles from 'react-particles-js';
import { WebcamComponent } from "../webcam/web-cam";
export default function Dashboard() {
  const [selectedMode, setSelectedMode] = useState(MASK_DETECTION);
  const [callComponant, setCallComponant] = useState(false)
  //setSelectedMode(MASK_DETECTION);

  return (
    
    <div className="desktop-Grid">
      {/* <div className="desktop-Grid-bar"></div> */}
      
      <div className="video-Grid">
      {callComponant ?
        <WebcamComponent selectedMode={selectedMode} /> :
        null
      }
      </div>
      <div className="fuction-Grid">

      </div>
      <div className="video-scroll-Grid-List">
        <div class="btn-group">
            <button onClick={() => {setSelectedMode(MASK_DETECTION);
              setCallComponant(true);
              }}>MASK DETECTION</button>
            <button onClick={() => setSelectedMode(PERSON_DETECTION)}>PERSON DETECTION</button>
            <button onClick={() => setSelectedMode(RECOGNIZE)}>RECOGNIZE</button>
          </div>

      </div>
      

    </div>
  );
}
