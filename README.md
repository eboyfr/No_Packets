# No_Packets

## main.html = your form

## web.xml = deployment descriptor (tells Tomcat about your servlet)

## MyServlet.java → compiled into MyServlet.class inside WEB-INF/classes/

## STEPS TO RUN APACHE:

1. ###  install apache
1. ###  https://tomcat.apache.org/download-11.cgi
1. ###  the binary -> core -> zipped
1. ###  unzip it and put it somewhere
1. ###  then run the startup.bat file in the bin folders
1. ###  Use this link to get the page: http://localhost:8080/MyWebApp/main.html

## STEPS TO MAKE CHANGES:

1. ###  compile the java file: javac -cp "C:\location_of_this_file\servlet-api.jar" MyServlet.java"

1. ###  move the new class file into the classes directory

1. ###  copy the MyWebApp directory and put it into the directory into the apache zip file called webapps

2. ### in the apache zip file bin folder run startup and then go to the link:http://localhost:8080/MyWebApp/main.html 