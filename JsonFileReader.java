import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;

public class JsonFileReader {
    public static Double rainFall;
    public static Double temperature;
    public static Double windSpeed;

public static void readWeatherData() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Use the correct path - try different locations
        String[] possiblePaths = {
            "jsonData/weather_data.json",
            "C:/Users/chris/No_Packets/MyWebApp/WEB-INF/example.json",
            "WEB-INF/classes/jsonData/weather_data.json"
        };
        
        File jsonFile = null;
        for (String path : possiblePaths) {
            jsonFile = new File(path);
            if (jsonFile.exists()) {
                System.out.println("Found weather file at: " + jsonFile.getAbsolutePath());
                break;
            }
        }
        
        if (jsonFile == null || !jsonFile.exists()) {
            System.out.println("Error: Weather JSON file not found in any location!");
            // Set default values
            rainFall = 0.0;
            temperature = 0.0;
            windSpeed = 0.0;
            return;
        }
        
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonFile);
            
            // Debug: print all available fields
            System.out.println("=== Available fields in JSON ===");
            jsonNode.fieldNames().forEachRemaining(field -> System.out.println("Field: " + field));
            
            // Read values with defaults
            rainFall = jsonNode.has("rain") ? jsonNode.get("rain").asDouble() : 0.0;
            temperature = jsonNode.has("temperature") ? jsonNode.get("temperature").asDouble() : 0.0;
            windSpeed = jsonNode.has("wind") ? jsonNode.get("wind").asDouble() : 0.0;
            
            System.out.println("Loaded - Rain: " + rainFall + ", Temp: " + temperature + ", Wind: " + windSpeed);
            
        } catch (IOException e) {
            System.out.println("Error reading JSON: " + e.getMessage());
            e.printStackTrace();
            rainFall = 0.0;
            temperature = 0.0;
            windSpeed = 0.0;
        }
}

    public static Double getRainFall() {
        return rainFall;
    }
    public static Double getTemperature() {
        return temperature;
    }
    public static Double getWindSpeed() {
        return windSpeed;
    }
    public static void main(String[] args) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // First, check if the file exists
        File jsonFile = new File("MyWebApp/WEB-INF/example.json");
        if (!jsonFile.exists()) {
            System.out.println("Error: JSON file does not exist at: " + jsonFile.getAbsolutePath());
            return;
        }
        
        System.out.println("Reading JSON file from: " + jsonFile.getAbsolutePath());
        
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonFile);
            
            // Print the entire JSON to see what's actually in the file
            // System.out.println("=== FULL JSON CONTENT ===");
            // System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode));
            // System.out.println("=========================");
            
            // Safely read values with null checks
            rainFall = jsonNode.has("rain") ? jsonNode.get("rain").asDouble() : null;
            temperature = jsonNode.has("temperature") ? jsonNode.get("temperature").asDouble() : null;
            windSpeed = jsonNode.has("wind") ? jsonNode.get("wind").asDouble() : null;
            
        }catch (IOException e) {
                System.out.println("Error reading JSON file: " + e.getMessage());
                e.printStackTrace();
            }
}
}
