var imgLocs = [
	"img/1.jpg",
	"img/2.jpg",
	"img/3.jpg",
	"img/4.jpg"
];

var msgs = [
	"Mom, you have been my guardian angel since the day I was born.",
	"Mom, you are my source of wisdom and the one who answers all my random questions.",
	"Mom, you hold our family together with selfless, tireless poise.",
	"Though far away, you are both my mother and soul sister. I love you with all my heart."
];


$(document).ready(function(){

	var photoNum = 0;
	var hasHand = false;

	Leap.loop(function(frame) {

		if(frame.hands.length > 0) {
			// just got the hand! 
			if(!hasHand) {
				// get the current text div and fade it
				if(photoNum !== 0) {
					$(".slideshow > p").fadeTo( "slow", 0);
				}

				// go to the next set of things
				photoNum++;

				// get the next image
				$(".slideshow").append("<img src='img/"+photoNum+".jpg' />");

				// show the next image but set its opacity to 0
				$(".slideshow > img").css({"opacity": 0});
				
				hasHand = true;

			} else {
				// map img's opacity to the hand's proximity to the center of Leap
				var hand = frame.hands[0];
				var x = hand.palmPosition[0];
				var z = hand.palmPosition[2];
				var distance = Math.sqrt(x*x + z*z);
				// distance goes from 0 to 200, fade goes from 1 to 0
				var fade = 1-distance/150;
				$(".slideshow > img").fadeTo( 0, fade);
			}
		}
		else {
			// just lost the hand!
			if(hasHand) {
				// hide photo
				$(".slideshow").empty();

				// fade in text
				$(".slideshow").append("<p>"+msgs[photoNum-1]+"</>");
				$(".slideshow > p").css({"opacity": 0});
				$(".slideshow > p").fadeTo( "slow", 1);

				hasHand = false;

			}
		}
	});
});

