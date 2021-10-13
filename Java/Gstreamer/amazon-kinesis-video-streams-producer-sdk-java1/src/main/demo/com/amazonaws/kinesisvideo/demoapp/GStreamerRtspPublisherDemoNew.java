package com.amazonaws.kinesisvideo.demoapp;

import static com.amazonaws.kinesisvideo.util.StreamInfoConstants.ABSOLUTE_TIMECODES;
import static com.google.common.base.Preconditions.checkArgument;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;

import com.amazonaws.auth.SystemPropertiesCredentialsProvider;
import com.amazonaws.kinesisvideo.common.exception.KinesisVideoException;
import com.amazonaws.kinesisvideo.demoapp.contants.DemoTrackInfos;
import com.amazonaws.kinesisvideo.internal.client.mediasource.MediaSource;
import com.amazonaws.kinesisvideo.java.client.KinesisVideoJavaClientFactory;
import com.amazonaws.kinesisvideo.java.mediasource.file.AudioVideoFileMediaSource;
import com.amazonaws.kinesisvideo.java.mediasource.file.AudioVideoFileMediaSourceConfiguration;
import com.amazonaws.kinesisvideo.producer.Tag;
import com.amazonaws.regions.Regions;



public class GStreamerRtspPublisherDemoNew {
    private static final Duration RETENTION_PERIOD = Duration.ofHours(1);
    private static final String STREAM_NAME = System.getProperty("kvs-stream");
    private static final int FPS_25 = 25;
    private static final int RETENTION_ONE_HOUR = 1;
    private static final String IMAGE_DIR = "src/main/resources/data/h264/";
    private static final String FRAME_DIR = "src/main/resources/data/audio-video-frames";
    public static void main(final String[] args) throws URISyntaxException, KinesisVideoException {
    	 System.out.println("Attaching stream HI");
        checkArgument(args.length == 2, "Expected stream name and rtsp URI arguments");
        final var streamName = args[0];
        final var rtspUri = args[1];
        System.err.println(String.format("Attaching stream %s to %s", streamName, rtspUri));

        // Create a Kinesis Video high level client.
        // This class wraps the native video client with Java syntactic sugar.
        final var kinesisVideoClient = KinesisVideoJavaClientFactory
                .createKinesisVideoClient(
                        Regions.US_EAST_1,
                        new SystemPropertiesCredentialsProvider());

        // Create a media source backed by a RTSP stream through GStreamer.
        // This class encapsulates producing the video frames and pushing them into the video producer.

//        final var mediaSource = new GStreamerRtspMediaSourceNew(
//                new URI(rtspUri),
//                RETENTION_PERIOD,
//                new Tag[] { new Tag("Produced-By", "Kinesis-Video-GStreamer-Demo1") });
        
        final MediaSource mediaSource =  new GStreamerRtspMediaSourceNew(new URI(rtspUri), RETENTION_PERIOD, new Tag[] { new Tag("Produced-By", "Kinesis-Video-GStreamer-Demo") });
        
 //       final MediaSource mediaSource = createFileMediaSource();

        // Register media source with the client
        System.out.println(mediaSource.toString());
        kinesisVideoClient.registerMediaSource((MediaSource)mediaSource);

        // Start streaming.
        // The media source will establish a connection to the RTSP endpoint through a GStreamer pipeline,
        // parse frames and then push them into the client. Thread management is handled by the KinesisVideoClient.
        mediaSource.start();
    }
    
    
    private static MediaSource createFileMediaSource() {
        final AudioVideoFileMediaSourceConfiguration configuration =
                new AudioVideoFileMediaSourceConfiguration.AudioVideoBuilder()
                        .withDir(FRAME_DIR)
                        .withRetentionPeriodInHours(RETENTION_ONE_HOUR)
                        .withAbsoluteTimecode(ABSOLUTE_TIMECODES)
                        .withTrackInfoList(DemoTrackInfos.createTrackInfoList())
                        .build();
        final AudioVideoFileMediaSource mediaSource = new AudioVideoFileMediaSource(STREAM_NAME);
        mediaSource.configure(configuration);

        return mediaSource;
    }

}
