package com.joy.KinesisProducer;

//Link for this project
//https://www.youtube.com/watch?v=05yauiKMWBM

//This project will no longer work as the DataStream has been deleted.

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import com.amazonaws.services.kinesis.AmazonKinesis;
import com.amazonaws.services.kinesis.model.PutRecordRequest;
import com.amazonaws.services.kinesis.model.PutRecordsRequest;
import com.amazonaws.services.kinesis.model.PutRecordsRequestEntry;
import com.amazonaws.services.kinesis.model.PutRecordsResult;
import com.amazonaws.services.kinesis.model.PutRecordsResultEntry;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.joy.KinesisProducer.aws.KinesisClient;
import com.joy.KinesisProducer.model.Order;

/**
 * Hello world!
 *
 */
public class App 
{
	
	List<String> productList = new ArrayList<String>();
	Random random = new Random();
    public static void main( String[] args ) throws InterruptedException
    {
        System.out.println( "Hello World!" );
        App app = new App();
        app.populateProductList();
        //1 get client
        AmazonKinesis kinesisClient = KinesisClient.getKinesisCleint();
        while(true) {
        	app.sendData(kinesisClient);
        	Thread.sleep(5000);
        }
        
       
    }
    
    private void sendData(AmazonKinesis kinesisClient) {
    	
        //2 PutRecordRequest
        //List<PutRecordsRequestEntry> requestEntryList = app.getRecordsRequestList();
        PutRecordsRequest recordRequest = new PutRecordsRequest();
        recordRequest.setStreamName("order-stream");
        recordRequest.setRecords(getRecordsRequestList());

       //3 put Record or putRecords - 500 Records with single API call
       PutRecordsResult result =  kinesisClient.putRecords(recordRequest);
       System.out.println(result);
       if(result.getFailedRecordCount() > 1) {
           System.out.println("Error Occoured... "+result.getFailedRecordCount());
       }else {
    	   System.out.println("Data sent successfully...");
       }

       //retry
       int failedRecords = result.getFailedRecordCount();
       for(PutRecordsResultEntry res : result.getRecords()) {
    	   if(res.getErrorCode() != null){
    		   
    	   }
       }
    }
    private List<Order> getOrderList(){
    	List<Order> orders = new ArrayList();
    	for(int i=-0; i<50; i++) {
    		Order order = new Order();
    		order.setOrderId(random.nextInt());
    		order.setProduct(productList.get(random.nextInt(productList.size())));
    		order.setQuantity(random.nextInt(20));
    		orders.add(order);
    	}
    	return orders;
    }
    private List<PutRecordsRequestEntry> getRecordsRequestList() {
    	Gson gson = new GsonBuilder().setPrettyPrinting().create();
    	List<PutRecordsRequestEntry> putRecordsRequestEntries = new ArrayList<PutRecordsRequestEntry>();
    	for(Order order: getOrderList()) {
    		PutRecordsRequestEntry requestEntry = new PutRecordsRequestEntry();
    		requestEntry.setData(ByteBuffer.wrap(gson.toJson(order).getBytes()));
    		requestEntry.setPartitionKey(UUID.randomUUID().toString());
    		putRecordsRequestEntries.add(requestEntry);
    	}
    	return putRecordsRequestEntries;
    }
    private void populateProductList() {
    	productList.add("Shirt");
    	productList.add("Pant");
    	productList.add("Belt");
    	productList.add("Cap");
    	productList.add("Coat");
    	productList.add("Shorts");
    	productList.add("Shoes");
    	productList.add("Accessories");
    }
}
