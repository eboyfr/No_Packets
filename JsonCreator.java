import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.File;
import java.time.LocalDate;
import java.util.Map;

import java.time.LocalTime;

public class JsonCreator {
    
    public static void createUserJson(String filename, String country, String city, LocalDate date, LocalTime time) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode jsonObject = mapper.createObjectNode();
            jsonObject.put("country", country);
            jsonObject.put("city", city);
            jsonObject.put("date", date.toString());
            jsonObject.put("time", time.toString());
            
            
            String filePath = "C:/Users/chris/No_Packets/" + filename;

            mapper.writerWithDefaultPrettyPrinter()
                  .writeValue(new File(filePath), jsonObject);
            
            System.out.println("JSON file created: " + filePath);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public static void createCustomJson(String filename, Map<String, Object> data) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.writerWithDefaultPrettyPrinter()
                  .writeValue(new File(filename), data);
            
            System.out.println("JSON file created: " + filename);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}