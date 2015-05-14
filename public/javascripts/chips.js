$(document).ready(function (){
	var passMatch = true;

	$('#sendSignUp').on('click', function (event){
		event.preventDefault();

		var unameInp = $('#usernameSU').val();
		var pwordInp = $('#passwordSU').val();
		var pword2Inp = $('#password2SU').val();
		var emailInp = $('#emailSU').val();

		passMatch = checkPassword(pwordInp, pword2Inp);

		if (passMatch) {
			showPasswordError (true);
			$.ajax({
				url : "/local-reg",
				method : 'post',
				data : {
					username : unameInp,
					password : pwordInp,
					email : emailInp
				}
			});
		} else {
			showPasswordError (true);
		}
	});
});

function checkPassword (pass1, pass2) {

	if (pass1 == pass2) {
		return true;
	} else {
		
		return false;
	}
}

function showPasswordError (show){
	if (show) {
		$('.passSU').css({
			'border-bottom-color' : 'red'
		});
	} else {
		$('.passSU').css({
			'border-bottom-color' : 'initial'
		});
	}
}

