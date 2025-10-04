import java.io.*;
import java.nio.file.Path;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;

@WebServlet("/MyServlet")
public class MyServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Retrieve input from HTML form
            String Country = request.getParameter("country");
            String City = request.getParameter("city");
            LocalDate date = LocalDate.parse(request.getParameter("date"));
            LocalTime time = LocalTime.parse(request.getParameter("time"));
            // Assign it to a Java variable
            String javaVariable = Country;
            String javaVariable2 = City;
            LocalDate javaVariable3 = date;
            LocalTime javaVariable4 = time;
            // Send response back to client
            String filename = "user_data.json";
            Path directoryPath = Paths.get("C:/Users/chris/No_Packets/jsonData");

            try {
                // Delete ALL files in the directory
                Files.list(directoryPath)
                    .filter(Files::isRegularFile)
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                            System.out.println("Deleted: " + path.getFileName());
                        } catch (IOException e) {
                            System.out.println("Failed to delete: " + path.getFileName());
                        }
                    });
                
            } catch (IOException e) {
                System.out.println("Error accessing directory: " + e.getMessage());
            }
            JsonCreator.createUserJson(filename, javaVariable, javaVariable2, javaVariable3, javaVariable4);
            // Set attributes for JSP
            request.setAttribute("country", Country);
            request.setAttribute("city", City);
            request.setAttribute("date", date);
            request.setAttribute("time", time);

            // Forward to view.jsp
            RequestDispatcher dispatcher = request.getRequestDispatcher("view.jsp");
            dispatcher.forward(request, response);
            //response.setContentType("text/html");
            //PrintWriter out = response.getWriter();
            // out.println("<h2>Country: " + javaVariable + "</h2>");
            // out.println("<h2>City: " + javaVariable2 + "</h2>");
            // out.println("<h2>Date: " + javaVariable3 + "</h2>");
            // out.println("<h2>Time: " + javaVariable4 + "</h2>");
        } catch (Exception e) {
            System.err.println("Error occurredbb: " + e.getMessage());
            e.printStackTrace();
    }
            //throws ServletException, IOException {
        // need to install tomcat server to run this code
        // https://tomcat.apache.org/download-11.cgi
        // the binary -> core -> zipped
        // unzip it and put it somewhere
        // then run the startup.bat file in the bin folder
        // then go to http://localhost:8080/ to see if it's working
        // Retrieve input from HTML form
        // String userInput = request.getParameter("country");

        // // Assign it to a Java variable
        // String javaVariable = userInput;

        // // Send response back to client
        // response.setContentType("text/html");
        // PrintWriter out = response.getWriter();
        // out.println("<h2>You entered: " + javaVariable + "</h2>");
    //}
}


}