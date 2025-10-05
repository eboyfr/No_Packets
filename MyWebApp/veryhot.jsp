<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>No Packets Weather App</title>
  <link rel="stylesheet" href="fivestates.css">

  <style>
    body {
      background-image: url('veryhotbackground.png'); /* Path to your image */
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      height: 100vh;
      margin: 0;
    }
    h2 {
            color: #faf7f7;
            border: 2px solid rgb(15, 195, 87);
            padding: 10px;
            background-color: rgb(15, 195, 87);
            width: fit-content;
            border-radius: 5px;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
            margin-bottom: 15px;
        }
  </style>

</head>

<body>

<audio autoplay loop>
    <source src="monkey.mp3" type="audio/mpeg">
  </audio>



  <!-- icon to query page -->
 <a href="main.html"><img src="Logo.png" alt="Logo" style="position: relative; top: 10px; left: 10px;"></a>
 <!-- image one -->
  <!-- window and temperature -->
<div id="photo-box">

  <img src="windowtest.png" alt="window">


  <p style="color: #6E1D04; font-size: 18px; text-align: center; margin-top: 60px;">
  Insert hotness here
</p>
</div>
<div id="weatherinterp">
    <img src="Sunny.gif" alt="cloudyGIF">
    <p style="color: #6E1D04;">This is some text!!</p>
</div>

<!-- the right box -->
 <div id="rightbigbox">

  <!-- smaller box in bigger box -->
  <div class="smallbox">
    <!-- <h2>Country: ${country}</h2>
    <h2>City: ${city}</h2>
    <h2>Date: ${date}</h2>
    <h2>Time: ${time}</h2> -->
    <!-- <br><br> -->
    <h2>Rain Fall: ${rain} mm</h2>
    <h2>Temperature: ${temperature} degrees celcius</h2>
    <h2>Wind Speed: ${wind} km/h</h2>
    <!-- <p style= "color: #6E1D04"></p> -->
    <!-- <p style= "color: #6E1D04">this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box this is some text in a box </p>
  <img src="sources/photo/burhcat.png" alt="Descriptive alt text" class="big-box-image-left"> -->
  <!-- <img src="sources/photo/burhcat.png" alt="Descriptive alt text" class="image-right">   -->
</div>

 </div>
   
<!-- <img src="right-long.png" alt="Dog with toy" class="image-right-page"> -->

<!-- <a href="main.html"><img src="Logo.png" alt="Logo" style="position: relative; top: 10px; left: 10px;"></a> -->
    
    
    <!-- <button onclick="window.location.href='main.html'">download</button> -->
</body>