package hackathlone.No_Packets;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

public class DatabaseAPI{
    String username;
    String password;

    public DatabaseAPI(String new_username, String new_password){
        username = new_username;
        password = new_password;
    }

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
        result += ":";

        if(date[1] < 10){
            result += "0";
        }
        result += String.valueOf(date[1]);
        result += ":";

        if(date[0] < 10){
            result += "0";
        }
        result += String.valueOf(date[0]);
        result += ":";

        return result;
    }

    private static String timeToString(int[] time){
        String result = "";
        for(int i=0; i<3; ++i){
            if(time[i] < 10){
                result += "0";
            }
            result += String.valueOf(time[i]);
            result += ":";
        }

        return result;
    }

        /*
         * date - 3 - Day, Month, Year
         * time - 3 - Hours, Minutes, Seconds
         * coordinates - 2 - Lat, Lon
         */
    private static URL makeURL(int[] date, int[] time, double coordinates[], int parameter, int specification){
        // the time is in UTC
        String stringURL = "https://api.meteomatics.com/";

        // YYYY-MM-DDThh:mm:ssZ
        stringURL += dateToString(date);
        stringURL += "T";
        stringURL += timeToString(time);
        stringURL += "Z/t_2m:C";

        stringURL += String.valueOf(coordinates[0]) + "," + String.valueOf(coordinates[1]);

        stringURL += "/json";
        
        try {
            URI uri = new URI(stringURL);
            URL url;
            url = uri.toURL();
            return url;
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (URISyntaxException e){
            e.printStackTrace();
        }
        return null;
    }

    // temporary - for testing
    public static void main(String[] args){
        int[] date = {15, 10, 2000};
        int[] time = {12, 30, 0};
        double[] coordinates = {10, -10};
        int parameter = 0;
        int specification = 0;
        System.out.println(makeURL(date, time, coordinates, parameter, specification));
    }
}