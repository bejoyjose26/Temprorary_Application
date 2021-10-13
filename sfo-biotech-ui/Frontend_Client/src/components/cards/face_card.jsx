import React from "react";
import styled from "styled-components";
import { motion, useMotionValue, useTransform } from "framer-motion";
//import face from "../assets/images/cards/face_card_Img.png";
import logo from "../../assets/images/logo-white.svg";

const CardWrapper = styled.div`
  width: 100%;
  perspective: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3em;
`;

const CardContainer = styled(motion.div)`
width: 350px;
height: 500px;
display: flex;
flex-direction: column;
border-radius: 25px;
box-shadow: 0 2px 7px 1px rgba(31, 31, 31, 0.2);
background-color: #1d1f21;
color: #fff;
position: relative;
cursor: grab;
`;

const CircleWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  min-width: 92%;
  min-height: 100%;
  overflow: hidden;
  border-top-right-radius: 25px;
`;

const Circle = styled.div`
  position: absolute;
  width: 350px;
  height: 350px;
  top: -4.2em;
  right: -10em;
  z-index: 5;
  background-color: #00BFFF;
  border-radius: 50%;
`;

const TopContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1.4;
  position: relative;
  align-items: center;
  justify-content: flex-end;
  padding: 1em 15px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex: 0.6;
  padding: 0 1em;
`;

const OverlapText = styled.h1`
  color: #fff;
  text-transform: uppercase;
  margin: 0;
  z-index: 10;
  font-size: 40px;
  font-weight: 900;
  position: absolute;
  //margin-right: 2em;
  margin-top: 6em;
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled(motion.div)`
  width: auto;
  height: 190px;
  z-index: 99;
  user-select: none;
  // margin-right: 2em;
   margin-top: -1.5em;

  img {
    width: auto;
    height: 100%;
    user-select: none;
  }
`;

const DetailsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2.5em 6px 0 6px;
  line-height: 1.4;
`;

const SmallText = styled.span`
  font-size: 11px;
  color: #fff;
  font-weight: 700;
  text-transform: uppercase;
`;

const SpacedHorizontalContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProceedButton = styled.button`
padding: 10px 16px;
background-color: #00BFFF;
color: #000;
text-transform: uppercase;
font-size: 16px;
font-weight: 700;
border: 3px solid transparent;
outline: none;
cursor: pointer;
transition: all 290ms ease-in-out;
border-radius: 8px;

&:hover {
  background-color: transparent;
  color: #fff;
  border: 3px solid #00BFFF;
}
`;

const AltadaLogo = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  margin-top: 7em;
  img {
    width: auto;
    height: 7px;
  }
`;
export default function FaceCard(props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);
  
  return (
    <CardWrapper>
      <CardContainer 
        style={{ x, y, rotateX, rotateY, z: 100 }}
        drag
        dragElastic={0.16}
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        whileTap={{ cursor: "grabbing" }}
      >
        <TopContainer>
          <CircleWrapper>
            <Circle>

            </Circle>
          </CircleWrapper>
          <ImageWrapper style={{position:'relative'}}>
            <Image style={{ x, y, rotateX, rotateY, z: 100000 }}
              drag
              dragElastic={0.12}
              whileTap={{ cursor: "grabbing" }}
            >
              <img src={props.img} />
              
            </Image>
            <OverlapText className='card-text'>FACE</OverlapText>
          </ImageWrapper>
          
        </TopContainer>
        <BottomContainer>
          <DetailsContainer>
          
            <SpacedHorizontalContainer>
              <SmallText>FACE DETECTION</SmallText>
              <ProceedButton>GO</ProceedButton>
            </SpacedHorizontalContainer>
          </DetailsContainer>
          <AltadaLogo style={{position:'absolute'}}>
            <img src={logo}/>
          </AltadaLogo>
        
        </BottomContainer>
      </CardContainer>
    </CardWrapper>
  );
}
