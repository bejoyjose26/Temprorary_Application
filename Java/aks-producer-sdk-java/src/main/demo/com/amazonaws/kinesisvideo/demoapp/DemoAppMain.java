package com.amazonaws.kinesisvideo.demoapp;

import com.amazonaws.kinesisvideo.client.KinesisVideoClient;
import com.amazonaws.kinesisvideo.demoapp.contants.DemoTrackInfos;
import com.amazonaws.kinesisvideo.internal.client.mediasource.MediaSource;
import com.amazonaws.kinesisvideo.common.exception.KinesisVideoException;
import com.amazonaws.kinesisvideo.demoapp.auth.AuthHelper;
import com.amazonaws.kinesisvideo.java.client.KinesisVideoJavaClientFactory;
import com.amazonaws.kinesisvideo.java.mediasource.file.AudioVideoFileMediaSource;
import com.amazonaws.kinesisvideo.java.mediasource.file.AudioVideoFileMediaSourceConfiguration;
import com.amazonaws.kinesisvideo.java.mediasource.file.ImageFileMediaSource;
import com.amazonaws.kinesisvideo.java.mediasource.file.ImageFileMediaSourceConfiguration;
import com.amazonaws.regions.Regions;

import static com.amazonaws.kinesisvideo.util.StreamInfoConstants.ABSOLUTE_TIMECODES;

import java.util.Properties;

/**
 * Demo Java Producer.
 */
public final class DemoAppMain {
    // Use a different stream name when testing audio/video sample
    private static final String STREAM_NAME = System.getProperty("kvs-stream");
    private static final int FPS_25 = 25;
    private static final int RETENTION_ONE_HOUR = 1;
    private static final String IMAGE_DIR = "src/main/resources/data/h264/";
    private static final String FRAME_DIR = "src/main/resources/data/audio-video-frames";
    // CHECKSTYLE:SUPPRESS:LineLength
    // Need to get key frame configured properly so the output can be decoded. h264 files can be decoded using gstreamer plugin
    // gst-launch-1.0 rtspsrc location="YourRtspUri" short-header=TRUE protocols=tcp ! rtph264depay ! decodebin ! videorate ! videoscale ! vtenc_h264_hw allow-frame-reordering=FALSE max-keyframe-interval=25 bitrate=1024 realtime=TRUE ! video/x-h264,stream-format=avc,alignment=au,profile=baseline,width=640,height=480,framerate=1/25 ! multifilesink location=./frame-%03d.h264 index=1
    private static final String IMAGE_FILENAME_FORMAT = "frame-%03d.h264";
    private static final int START_FILE_INDEX = 1;
    private static final int END_FILE_INDEX = 375;

    private DemoAppMain() {
        throw new UnsupportedOperationException();
    }
    
    public static void main(final String[] args) {
    	
    	Properties props = System.getProperties();
    	props.setProperty("aws.accessKeyId", "ASIATO7YQHBBIYJVUUHY");
    	props.setProperty("aws.secretKey", "ce4aUa0Os0V5nCkS5XsHmXKZLBjVQUuAVShAMUOE");
    	props.setProperty("aws.sessionToken", "IQoJb3JpZ2luX2VjEAcaCWV1LXdlc3QtMSJHMEUCIFAE5uecwiW0yPRnrWNC8DQ5pOURYWB0ZFO7KNIGbO1UAiEAqmCDJwrKuF9WBxajDYKXQ2e9wPovzlCEcdfTv62Rc4gqiQMIYBAAGgwyMzgzNTQ5NzA2OTAiDClFe8LAg4Irxzl8aCrmAkO4sHGn0g0ufvAmgBaMBVp2tVPt2P62JHLjk0FICqj1JCzFXmyIMtrYUJznNYNMg76kj8CeTbDxnmivKO56EE8NuK+hHs3gdQCYukH+reY0UFLkKORvEQn9su+N5tXdT73blaPRKtWVXYHd579hSGKGaUUw86ywjUdpFp/M59JBjBVkhUfai8Xbv7z5WLub6XYqIXZVvLYqqrUmYidW42Gt/GEqjyAy8TnR66VcEHsOE1AE1uUhEgSPIxr1d+7efW3cPVSJdQx9BS8TZO5fMILiJewfZFrRhXCt4fqGglpVE119eIAOVrcwPagBR1FW4DQwjRwclEY+vUV2AQaoSDG32lhoyZi7ANUH1B7GruBsJ4IpYl4DAxOK6UhjY/5ilw8062IJOx9MLsDoZKn3rjwk7iof+TKdkgm2c8uDkGkN1aD2yEoT3+FdMxpekfUSPYuJncEL+3svPVbDf6MwZhCbP9suC+Mw5ZWIigY6pgF4pY4DIQRhKpeXaEciIsrePth70zlaX53wmm7A4bFeKp6WTHMnALLQR+te2cKBy85OBF++swk6o5aAE6Vttd9DFUHVHJCFO");
    	
        try {
            // create Kinesis Video high level client
            final KinesisVideoClient kinesisVideoClient = KinesisVideoJavaClientFactory
                    .createKinesisVideoClient(
                            Regions.US_EAST_1,
                            AuthHelper.getSystemPropertiesCredentialsProvider());

            // create a media source. this class produces the data and pushes it into
            // Kinesis Video Producer lower level components
            final MediaSource mediaSource = createImageFileMediaSource();

            // Audio/Video sample is available for playback on HLS (Http Live Streaming)
            //final MediaSource mediaSource = createFileMediaSource();

            // register media source with Kinesis Video Client
            kinesisVideoClient.registerMediaSource(mediaSource);

            // start streaming
            mediaSource.start();
        } catch (final KinesisVideoException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Create a MediaSource based on local sample H.264 frames.
     *
     * @return a MediaSource backed by local H264 frame files
     */
    private static MediaSource createImageFileMediaSource() {
        final ImageFileMediaSourceConfiguration configuration =
                new ImageFileMediaSourceConfiguration.Builder()
                        .fps(FPS_25)
                        .dir(IMAGE_DIR)
                        .filenameFormat(IMAGE_FILENAME_FORMAT)
                        .startFileIndex(START_FILE_INDEX)
                        .endFileIndex(END_FILE_INDEX)
                        //.contentType("video/hevc") // for h265
                        .build();
        final ImageFileMediaSource mediaSource = new ImageFileMediaSource(STREAM_NAME);
        mediaSource.configure(configuration);

        return mediaSource;
    }

    /**
     * Create a MediaSource based on local sample H.264 frames and AAC frames.
     *
     * @return a MediaSource backed by local H264 and AAC frame files
     */
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
