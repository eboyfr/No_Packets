import java.io.*;
import java.time.LocalDate;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

@WebServlet("/MyServlet")
public class MyServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Retrieve input from HTML form
            String Country = request.getParameter("country");
            String City = request.getParameter("city");
            LocalDate date = LocalDate.parse(request.getParameter("date"));
            // Assign it to a Java variable
            String javaVariable = Country;
            String javaVariable2 = City;
            LocalDate javaVariable3 = date;
            // Send response back to client
            response.setContentType("text/html");
            PrintWriter out = response.getWriter();
            out.println("<h2>Country: " + javaVariable + "</h2>");
            out.println("<h2>City: " + javaVariable2 + "</h2>");
            out.println("<h2>Date: " + javaVariable3 + "</h2>");
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