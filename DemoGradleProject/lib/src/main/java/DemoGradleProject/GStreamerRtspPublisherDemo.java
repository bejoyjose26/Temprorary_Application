package DemoGradleProject;

import static com.google.common.base.Preconditions.checkArgument;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;

import com.amazonaws.auth.SystemPropertiesCredentialsProvider;
import com.amazonaws.kinesisvideo.common.exception.KinesisVideoException;
import com.amazonaws.kinesisvideo.internal.client.mediasource.MediaSource;
import com.amazonaws.kinesisvideo.java.client.KinesisVideoJavaClientFactory;
import com.amazonaws.kinesisvideo.producer.Tag;
import com.amazonaws.regions.Regions;



public class GStreamerRtspPublisherDemo {
    private static final Duration RETENTION_PERIOD = Duration.ofHours(1);

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
        final var mediaSource = new GStreamerRtspMediaSource(
                new URI(rtspUri),
                RETENTION_PERIOD,
                new Tag[] { new Tag("Produced-By", "Kinesis-Video-GStreamer-Demo") });

        // Register media source with the client
        kinesisVideoClient.registerMediaSource((MediaSource) mediaSource);

        // Start streaming.
        // The media source will establish a connection to the RTSP endpoint through a GStreamer pipeline,
        // parse frames and then push them into the client. Thread management is handled by the KinesisVideoClient.
        mediaSource.start();
    }

}
