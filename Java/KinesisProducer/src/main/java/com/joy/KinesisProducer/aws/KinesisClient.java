package com.joy.KinesisProducer.aws;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.kinesis.AmazonKinesis;
import com.amazonaws.services.kinesis.AmazonKinesisClientBuilder;

public class KinesisClient {
	public static final String  AWS_ACCESS_KEY = "aws.accessKeyId";
	public static final String  AWS_SECRETE_KEY = "aws.secretKey";
	public static final String  AWS_SESSION_TOKEN = "aws.sessionToken";
	
	
	static {
		System.setProperty(AWS_ACCESS_KEY, "ASIATO7YQHBBJU2F7LXA");
		System.setProperty(AWS_SECRETE_KEY, "97BeUqC4ynd4FPxVz9Mze28kqmwI0T3ugjGY7HP8");
		System.setProperty(AWS_SESSION_TOKEN, "IQoJb3JpZ2luX2VjEAQaCWV1LXdlc3QtMSJIMEYCIQDQ0l6qWzQXluR5HCAgUVGcorO22RFdeY0nHZZKkEM0JAIhAJ3L4CC0YeboFOneFPi0oXhcB22EUlDSIFvNlywF8/LNKokDCF0QABoMMjM4MzU0OTcwNjkwIgzFZpNjXv9mK2M+T3Yq5gId1SWLq1NIgpJlAoWSvaDtF2P5mr7cnHRLGq1LiokbB8IwKLYWzCk8m6qb2nGTdu3RYrDpp4JGPAkNBv/e/H4jsqWZwWHoP8EdEjQRmXCSZWsi9v1jnCtw2YT1GptEaDz+HwBiqx2WGVkfXVsQHVtURtwf3Sdg2obBwwf+Bpew3Mct8RZ3DqqZjFTj1B4+hVhzFcWIuGJCebn5gAucNYzKLDGrZPiXMo4X3bAFGEFBFJ1INXVFCtvatrRHwxQvVwiVPrQSZKtvVpwxOm7iR3pMW3BENblAByY1M7o1eVav/X0WfcAE2fA8QMDHd3jDNWPa6xlNzQ8bI4MZDFEkD1EZkyeAuTkvM1/WX7+D5u4ouDQBtSrHJh/v3BVDKAsYadj4YGmCauGIo9a5Xhxblu4ndKlgqCyolvsgoJtf/D/bMzqMUzeW7T23fv2EFKkazYNJdYgVTgMNQ3kF/GJYn5Wcd6tZptmaMN2xh4oGOqUBH90eN7A9kxAOr1yiiLMUdBU+l6aIh4tceuAD6Xy90jmGqoX2c1/aElo2VQkW/nYtc3X42IN1hPhVq28RAjhmx0DTz3WbnMOCU+mNj45MWz8Xd0MYkKDIAT6T12geLaZHdrvphx8jtNyHI8rW5Osf4u0JpXWySqSfw4f1kPb7BELmHva8bJHRqcVVCEzxAsuikJbN4JLDByUUBHtH+tVSMqYNdQvy");
	}
	
	public static AmazonKinesis getKinesisCleint() {
		return AmazonKinesisClientBuilder.standard()
				.withRegion(Regions.US_EAST_1)
				.build();
	}
}
