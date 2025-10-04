// Using https://github.com/meteomatics/java-connector-api/blob/master/MeteomaticsExample.java
// as reference
// Also https://www.meteomatics.com API and documentation/general website

package hackathlone.No_Packets;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import java.net.HttpURLConnection;

public class DatabaseAPI{
    String username;
    String password;

    // public DatabaseAPI(String new_username, String new_password){
    //     username = new_username;
    //     password = new_password;
    // }
    public DatabaseAPI(){}

    private static String dateToString(int[] date){
        String result = "";
        if(date[2] < 1000){
            result += "0";
            if(date[2] < 100){
                result += "0";
                if(date[2] < 10){
                    result += "0";
                }
            }
        }
        result += String.valueOf(date[2]);
        result += "-";

        if(date[1] < 10){
            result += "0";
        }
        result += String.valueOf(date[1]);
        result += "-";

        if(date[0] < 10){
            result += "0";
        }
        result += String.valueOf(date[0]);

        return result;
    }

    private static String timeToString(int[] time){
        String result = "";
        for(int i=0; i<3; ++i){
            if(time[i] < 10){
                result += "0";
            }
            result += String.valueOf(time[i]);
            if(i != 2){
                result += ":";
            }
        }

        return result;
    }


    /*  
     * Currently Avaliable:
     * Temporal Level = Climatology
     * Parameters = T2M 
     * Location = Lat, Lon
     * Community = AG (hardcoded)
     * time-standard=LST&format=JSON (hardcoded)
     * start, end = year 
    */
    private static URL makeURL(int[] years, double coordinates[]){
        // the time is in LST
        String stringURL = "https://power.larc.nasa.gov/api/temporal/climatology/point?";

        // https://power.larc.nasa.gov/api/temporal/climatology/point?start=2000&end=2024&latitude=51.592&longitude=-93.2934&community=AG&parameters=T2M&time-standard=LST&format=JSON
        

        stringURL += "start=" + String.valueOf(years[0]);
        stringURL += "&end=" + String.valueOf(years[1]);

        stringURL += "&latitude=" + String.valueOf(coordinates[0]);
        stringURL += "&longitude=" + String.valueOf(coordinates[1]);

        stringURL += "&community=AG&parameters=T2M&user=NoPackets&time-standard=LST&format=JSON";
        
        try {
            URI uri = new URI(stringURL);
            URL url;
            url = uri.toURL();
            // System.out.println(stringURL);
            return url;
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (URISyntaxException e){
            e.printStackTrace();
        }
        return null;
    }

    private String getCredentials(){
        String credentials = username + ":" + password;
        return Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    private void proxyFix(){

        System.setProperty("java.net.useSystemProxies", "true");
        System.setProperty("java.net.preferIPv4Stack", "true");


        String httpProxy = System.getenv("http_proxy");
        String httpsProxy = System.getenv("https_proxy");

        
            try {
                if (httpProxy != null && !httpProxy.isEmpty()) {
                    URI proxyUri;
                    proxyUri = new URI(httpProxy);

                    System.setProperty("http.proxyHost", proxyUri.getHost());
                    System.setProperty("http.proxyPort", String.valueOf(proxyUri.getPort()));
                }

                if (httpsProxy != null && !httpsProxy.isEmpty()) {
                    URI proxyUri = new URI(httpsProxy);
                    System.setProperty("https.proxyHost", proxyUri.getHost());
                    System.setProperty("https.proxyPort", String.valueOf(proxyUri.getPort()));
                }

            } catch (URISyntaxException e) {
                e.printStackTrace();
            }
        
    }
    
    private void sendRequest(){
        int[] years = {2014, 2024};
        double[] coordinates = {10, -10};
        URL url = makeURL(years, coordinates);
        // String encoding = getCredentials();
        HttpURLConnection conn;
        boolean tryAgain = true;
        // for(int i=0; tryAgain; ++i){
            try {
                proxyFix();
                conn = (HttpURLConnection) url.openConnection();
                conn.setDoOutput(true);
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Accept", "application/json");
                // conn.setRequestProperty("Authorization", "Basic " + encoding);

                System.out.println(conn.getResponseCode());
                if (conn.getResponseCode() != 200) {
                    throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
                }

                BufferedReader streamReader = new BufferedReader(new InputStreamReader((conn.getInputStream())));

                StringBuilder responseStrBuilder = new StringBuilder();

                String inputStr;
                while ((inputStr = streamReader.readLine()) != null) {
                    responseStrBuilder.append(inputStr);
                    System.out.print(responseStrBuilder.toString());
                }
                tryAgain = false;
            } catch (IOException e) {
                e.printStackTrace();
                // System.out.println(i);
            }
        // }
    }

    // temporary - for testing
    public static void main(String[] args){
        // String username = "hackathlone_zubareva_diana";
        // String password = "48ffWh9VhFNsVGl2EZl3";
        
        // DatabaseAPI dAPI = new DatabaseAPI(username, password);
        // dAPI.sendRequest();

        int[] years = {2014, 2024};
        double[] coordinates = {10, -10};
        System.out.println(makeURL(years, coordinates));
        
        DatabaseAPI dApi = new DatabaseAPI();
        dApi.sendRequest();
    }
}