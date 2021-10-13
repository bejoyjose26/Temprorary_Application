package DemoGradleProject;

import static com.google.common.base.Preconditions.checkArgument;

import java.net.URISyntaxException;

import com.amazonaws.kinesisvideo.client.KinesisVideoClient;
import com.amazonaws.kinesisvideo.common.exception.KinesisVideoException;
import com.amazonaws.kinesisvideo.demoapp.auth.AuthHelper;
import com.amazonaws.kinesisvideo.java.client.KinesisVideoJavaClientFactory;
import com.amazonaws.regions.Regions;

public class my_demo {
	 public static void main(final String[] args) throws URISyntaxException, KinesisVideoException {
		 System.out.println("Attaching stream HI1");
	     checkArgument(args.length == 2, "Expected stream name and rtsp URI arguments");
	     final var streamName = args[0];
	     final var rtspUri = args[1];
	     System.err.println(String.format("Attaching stream %s to %s", streamName, rtspUri));
	     final KinesisVideoClient kinesisVideoClient = KinesisVideoJavaClientFactory
                 .createKinesisVideoClient(
                         Regions.US_EAST_1,
                         AuthHelper.getSystemPropertiesCredentialsProvider());
	 }
}
