<!-- filepath: c:\Users\chris\No_Packets\MyWebApp\view.jsp -->
<!DOCTYPE html>
<html>
<head>
    <title>View Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 20px;
        }
        h2 {
            color: #333;
        }
    </style>
    <link rel='stylesheet' type='text/css' media='screen' href='style.css'>
</head>

<body>
    <a href="main.html"><img src="Logo.png" alt="Logo" style="position: relative; top: 10px; left: 10px;"></a>
    <h2>Country: ${country}</h2>
    <h2>City: ${city}</h2>
    <h2>Date: ${date}</h2>
    <h2>Time: ${time}</h2>
    <br><br>
    <h2>Rain Fall: ${rainFall}</h2>
    <h2>Temperature: ${temperature}</h2>
    <h2>Wind Speed: ${windSpeed}</h2>
    
    <button onclick="window.location.href='main.html'">download</button>
</body>


</html>