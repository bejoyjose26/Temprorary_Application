
import { MASK_DETECTION, PERSON_DETECTION, RECOGNIZE } from "./endpoints";
import {SignalingClient} from "amazon-kinesis-video-streams-webrtc";
import { IDENTITY_POOL_ID, REGION, ACCESS_KEY_ID, SECRET_ACCESS_KEY,SESSION_TOKEN,CHANNEL_NAME,CHANNEL_ARN} from "./authentication";
import AWS from 'aws-sdk';
import React,{ useState } from "react";
import './App.css';

/**
 * Signaling client role.
 */
 const Role = {
  MASTER: 'MASTER',
  VIEWER:'VIEWER',
}
const master = {
  //signalingClient: null,
  peerConnectionByClientId: {},
  dataChannelByClientId: {},
  localStream: null,
  remoteStreams: [],
  peerConnectionStatsInterval: null,
};
function App() {

  const [selectedMode, setSelectedMode] = useState(MASK_DETECTION);
  const [callComponant, setCallComponant] = useState(false)

  function onStatsReport(report) {
    // TODO: Publish stats
  }


  async function startMaster() {
      //alert("Hi");
      const localView = document.getElementsByClassName('local-view')[0];
      const remoteView = document.getElementsByClassName('remote-view')[0];

      master.localView = localView;
      master.remoteView = remoteView;
      const kinesisVideoClient = new AWS.KinesisVideo({
        region: REGION,
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        sessionToken: SESSION_TOKEN,
        correctClockSkew: true,
    });


    // Get signaling channel ARN
    const describeSignalingChannelResponse = await kinesisVideoClient
    .describeSignalingChannel({
        ChannelName: CHANNEL_NAME,
    })
    .promise();
    const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
    console.log('[MASTER] Channel ARN: ', channelARN);


    // Get signaling channel endpoints
    const getSignalingChannelEndpointResponse = await kinesisVideoClient
    .getSignalingChannelEndpoint({
        ChannelARN: channelARN,
        SingleMasterChannelEndpointConfiguration: {
            Protocols: ['WSS', 'HTTPS'],
            Role: Role.MASTER,
        },
    })
    .promise();
    console.log('[MASTER] Channel ARN: ', getSignalingChannelEndpointResponse);

    const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
      endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
      return endpoints;
    }, {});
    console.log('[MASTER] Endpoints: ', endpointsByProtocol);


    // Create Signaling Client
    console.log('[MASTER] Channel ARN: ');
    master.signalingClient = new SignalingClient({
      channelARN,
      channelEndpoint: endpointsByProtocol.WSS,
      role: Role.MASTER,
      region: REGION,
      credentials: {
          accessKeyId: ACCESS_KEY_ID,
          secretAccessKey: SECRET_ACCESS_KEY,
          sessionToken: SESSION_TOKEN,
      },
      systemClockOffset: kinesisVideoClient.config.systemClockOffset,
    });

    // Get ICE server configuration
      const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
        region: REGION,
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        sessionToken: SESSION_TOKEN,
        endpoint: endpointsByProtocol.HTTPS,
        correctClockSkew: true,
      });
      const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
      .getIceServerConfig({
          ChannelARN: channelARN,
      })
      .promise();
      console.log('[MASTER] SignalingClient:',getIceServerConfigResponse);

      const iceServers = [];
      iceServers.push({ urls: `stun:stun.kinesisvideo.${REGION}.amazonaws.com:443` });
      getIceServerConfigResponse.IceServerList.forEach(iceServer =>
        iceServers.push({
            urls: iceServer.Uris,
            username: iceServer.Username,
            credential: iceServer.Password,
        }),
      );
      console.log('[MASTER] ICE servers: ', iceServers);
      const forceTURN = false;
      const widescreen = true;
      const sendVideo = true;
      const sendAudio = false;
      const openDataChannel = false;
      const useTrickleICE = true;
      
      
      const configuration = {
        iceServers,
        iceTransportPolicy: forceTURN ? 'relay' : 'all',
      };

      const resolution = widescreen ? { width: { ideal: 550 }, height: { ideal: 440 } } : { width: { ideal: 550 }, height: { ideal: 440 } };
      const constraints = {
          video: sendVideo ? resolution : false,
          audio: sendAudio,
      };

      
      // Get a stream from the webcam and display it in the local view. 
      // If no video/audio needed, no need to request for the sources. 
      // Otherwise, the browser will throw an error saying that either video or audio has to be enabled.
      if (sendVideo || sendAudio) {
        try {
            master.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            localView.srcObject = master.localStream;
            console.log('[-MASTER-] Could find webcam ',localView.srcObject);
        } catch (e) {
            console.error('[MASTER] Could not find webcam');
        }
      }
      
      master.signalingClient.on('open', async () => {
        console.log('[MASTER] Connected to signaling service');
      });

      master.signalingClient.on('sdpOffer', async (offer, remoteClientId) => {
          console.log('[MASTER] Received SDP offer from client: ' + remoteClientId);

          // Create a new peer connection using the offer from the given client
          const peerConnection = new RTCPeerConnection(configuration);
          master.peerConnectionByClientId[remoteClientId] = peerConnection;

          //NOt REQ
          if (openDataChannel) {
            master.dataChannelByClientId[remoteClientId] = peerConnection.createDataChannel('kvsDataChannel');
            peerConnection.ondatachannel = event => {
              // event.channel.onmessage = onRemoteDataMessage;
            };
        }

        // Poll for connection stats
        if (!master.peerConnectionStatsInterval) {
            master.peerConnectionStatsInterval = setInterval(() => peerConnection.getStats().then(onStatsReport), 1000);
        }

        //NOt REQ


        // Send any ICE candidates to the other peer
        peerConnection.addEventListener('icecandidate', ({ candidate }) => {
          if (candidate) {
              console.log('[MASTER] Generated ICE candidate for client: ' + remoteClientId);

              // When trickle ICE is enabled, send the ICE candidates as they are generated.
              if (useTrickleICE) {
                  console.log('[MASTER] Sending ICE candidate to client: ' + remoteClientId);
                  master.signalingClient.sendIceCandidate(candidate, remoteClientId);
              }
          } else {
              console.log('[MASTER] All ICE candidates have been generated for client: ' + remoteClientId);

              // When trickle ICE is disabled, send the answer now that all the ICE candidates have ben generated.
              if (!useTrickleICE) {
                  console.log('[MASTER] Sending SDP answer to client: ' + remoteClientId);
                  master.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
              }
          }
        });
        // As remote tracks are received, add them to the remote view
        peerConnection.addEventListener('track', event => {
          console.log('[MASTER] Received remote track from client: ' + remoteClientId);
          if (remoteView.srcObject) {
              return;
          }
          remoteView.srcObject = event.streams[0];
        });
        if (master.localStream) {
          master.localStream.getTracks().forEach(track => peerConnection.addTrack(track, master.localStream));
        }
        await peerConnection.setRemoteDescription(offer);


        console.log('[MASTER] Creating SDP answer for client: ' + remoteClientId);
        await peerConnection.setLocalDescription(
            await peerConnection.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            }),
        );

        // When trickle ICE is enabled, send the answer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
        if (useTrickleICE) {
            console.log('[MASTER] Sending SDP answer to client: ' + remoteClientId);
            master.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
        }
        console.log('[MASTER] Generating ICE candidates for client: ' + remoteClientId);      


      });


      master.signalingClient.on('iceCandidate', async (candidate, remoteClientId) => {
        console.log('[MASTER] Received ICE candidate from client: ' + remoteClientId);

        // Add the ICE candidate received from the client to the peer connection
        const peerConnection = master.peerConnectionByClientId[remoteClientId];
        peerConnection.addIceCandidate(candidate);
      });

      master.signalingClient.on('close', () => {
          console.log('[MASTER] Disconnected from signaling channel');
      });

      master.signalingClient.on('error', () => {
          console.error('[MASTER] Signaling client error');
      });
      
      
      console.log('[MASTER] Starting master connection');
      master.signalingClient.open();
  }



  function getRandomClientId() {
    return Math.random()
        .toString(36)
        .substring(2)
        .toUpperCase();
}


  const viewer = {};
  async function startViewer() {


    const forceTURN = false;
    const widescreen = true;
    const sendVideo = true;
    const sendAudio = false;
    const openDataChannel = false;
    const useTrickleICE = true;
    const clientId = "0IUEZE62PS8";
    const localView = document.getElementsByClassName('local-view')[0];
    const remoteView = document.getElementsByClassName('remote-view')[0];
    master.localView = localView;
    master.remoteView = remoteView;

    // Create KVS client
    const kinesisVideoClient = new AWS.KinesisVideo({
      region: REGION,
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      sessionToken: SESSION_TOKEN,
      correctClockSkew: true,
    });
    console.log('[VIEWER] Starting viewer connection',kinesisVideoClient);

    // Get signaling channel ARN
    const describeSignalingChannelResponse = await kinesisVideoClient
      .describeSignalingChannel({
          ChannelName: CHANNEL_NAME,
      })
      .promise();
    console.log('[VIEWER] Channel ARN: ', describeSignalingChannelResponse);
    const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
    console.log('[VIEWER] Channel ARN: ', channelARN);


    // Get signaling channel endpoints
    const getSignalingChannelEndpointResponse = await kinesisVideoClient
    .getSignalingChannelEndpoint({
        ChannelARN: channelARN,
        SingleMasterChannelEndpointConfiguration: {
            Protocols: ['WSS', 'HTTPS'],
             Role: Role.VIEWER,
        },
    })
    .promise();
    console.log('[VIEWER] Channel ARN: ', getSignalingChannelEndpointResponse);
    const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
        endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
        return endpoints;
    }, {});
    console.log('[VIEWER] Endpoints: ', endpointsByProtocol);
   

    const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
      region: REGION,
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      sessionToken: SESSION_TOKEN,
      endpoint: endpointsByProtocol.HTTPS,
      correctClockSkew: true,
    });
    console.log('[VIEWER] Endpoints1: ', kinesisVideoSignalingChannelsClient);

    // Get ICE server configuration
    const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
    .getIceServerConfig({
        ChannelARN: channelARN,
    })
    .promise();
    console.log('[VIEWER] Endpoints1: ', getIceServerConfigResponse);

    const iceServers = [];
    iceServers.push({ urls: `stun:stun.kinesisvideo.${REGION}.amazonaws.com:443` });
    console.log('[VIEWER] SignalingClient:',getIceServerConfigResponse);
    getIceServerConfigResponse.IceServerList.forEach(iceServer =>
        iceServers.push({
            urls: iceServer.Uris,
            username: iceServer.Username,
            credential: iceServer.Password,
        }),
    );
    console.log('[VIEWER] ICE servers1: ', iceServers);

    viewer.signalingClient = new SignalingClient({
      channelARN,
      channelEndpoint: endpointsByProtocol.WSS,
      clientId,
      role: Role.VIEWER,
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        sessionToken: SESSION_TOKEN,
      },
      systemClockOffset: kinesisVideoClient.config.systemClockOffset,
    });

   
    console.log('[VIEWER] ICE servers12: ', viewer.signalingClient);
 

    const resolution = widescreen ? { width: { ideal: 550 }, height: { ideal: 440 } } : { width: { ideal: 550 }, height: { ideal: 440 } };
    const constraints = {
      video: sendVideo ? resolution : false,
      audio: sendAudio,
    };

    const configuration = {
        iceServers,
        iceTransportPolicy: forceTURN ? 'relay' : 'all',
    };
    
    //NOt REQ
    viewer.peerConnection = new RTCPeerConnection(configuration);
    if (openDataChannel) {
        viewer.dataChannel = viewer.peerConnection.createDataChannel('kvsDataChannel');
        viewer.peerConnection.ondatachannel = event => {
            //event.channel.onmessage = onRemoteDataMessage;
        };
    }

        // Poll for connection stats
      viewer.peerConnectionStatsInterval = setInterval(() => viewer.peerConnection.getStats().then(onStatsReport), 1000);

      viewer.signalingClient.on('open', async () => {
        console.log('[VIEWER] Connected to signaling service');

        // Get a stream from the webcam, add it to the peer connection, and display it in the local view.
        // If no video/audio needed, no need to request for the sources. 
        // Otherwise, the browser will throw an error saying that either video or audio has to be enabled.
        if (sendVideo || sendAudio) {
            try {
                viewer.localStream = await navigator.mediaDevices.getUserMedia(constraints);
                viewer.localStream.getTracks().forEach(track => viewer.peerConnection.addTrack(track, viewer.localStream));
                localView.srcObject = viewer.localStream;
            } catch (e) {
                console.error('[VIEWER] Could not find webcam');
                return;
            }
        }

        // Create an SDP offer to send to the master
        console.log('[VIEWER] Creating SDP offer');
        await viewer.peerConnection.setLocalDescription(
            await viewer.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            }),
        );

        // When trickle ICE is enabled, send the offer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
        if (useTrickleICE) {
            console.log('[VIEWER] Sending SDP offer');
            viewer.signalingClient.sendSdpOffer(viewer.peerConnection.localDescription);
        }
        console.log('[VIEWER] Generating ICE candidates');
    });

    viewer.signalingClient.on('sdpAnswer', async answer => {
      // Add the SDP answer to the peer connection
      console.log('[VIEWER] Received SDP answer');
      await viewer.peerConnection.setRemoteDescription(answer);
    });

    viewer.signalingClient.on('iceCandidate', candidate => {
      // Add the ICE candidate received from the MASTER to the peer connection
      console.log('[VIEWER] Received ICE candidate');
      viewer.peerConnection.addIceCandidate(candidate);
    });

    viewer.signalingClient.on('close', () => {
        console.log('[VIEWER] Disconnected from signaling channel');
    });    


    viewer.signalingClient.on('error', error => {
      console.error('[VIEWER] Signaling client error: ', error);
    });

    // Send any ICE candidates to the other peer
    viewer.peerConnection.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate) {
          console.log('[VIEWER] Generated ICE candidate');

          // When trickle ICE is enabled, send the ICE candidates as they are generated.
          if (useTrickleICE) {
              console.log('[VIEWER] Sending ICE candidate');
              viewer.signalingClient.sendIceCandidate(candidate);
          }
      } else {
          console.log('[VIEWER] All ICE candidates have been generated');

          // When trickle ICE is disabled, send the offer now that all the ICE candidates have ben generated.
          if (!useTrickleICE) {
              console.log('[VIEWER] Sending SDP offer');
              viewer.signalingClient.sendSdpOffer(viewer.peerConnection.localDescription);
          }
      }
    });
    alert("Hi2 ");
    // As remote tracks are received, add them to the remote view
    viewer.peerConnection.addEventListener('track', event => {
      console.log('[VIEWER] Received remote track');
      if (remoteView.srcObject) {
          return;
      }
      viewer.remoteStream = event.streams[0];
      remoteView.srcObject = viewer.remoteStream;
    });

    console.log('[VIEWER] Starting viewer connection');
    viewer.signalingClient.open();    
  }



  return (
    <div className="desktop-Grid">
      {/* <div className="desktop-Grid-bar"></div> */}
      
      <div className="video-Grid">
        <div id="master" className="d-none">
            <div className="row-video-pallet">
                <div className="col-video-pallet">
                    <div className="video-container"><video className="local-view" autoPlay playsInline controls muted /></div>
                </div>
                <div className="col-video-pallet1">
                    <div className="video-container"><video className="remote-view" autoPlay playsInline controls /></div>
                </div>
            </div>
        </div>    

      </div>
      <div className="fuction-Grid">

      </div>
      <div className="video-scroll-Grid-List">
        <div className="btn-group">
            <button onClick={() => {setSelectedMode(MASK_DETECTION);
              setCallComponant(true);
              }}>MASK DETECTION</button>
            <button onClick={() => setSelectedMode(PERSON_DETECTION)}>PERSON DETECTION</button>
            <button onClick={() => setSelectedMode(RECOGNIZE)}>RECOGNIZE</button>
        </div>
        <div>
            <button id="master-button" type="button" className="btn btn-primary" 
                onClick={startMaster}> Start Master</button>
            <button id="viewer-button" type="button" className="btn btn-primary" 
                onClick={startViewer}> Viewer Master</button>
        </div>

      </div>
      

    </div>
  );
}

export default App;
