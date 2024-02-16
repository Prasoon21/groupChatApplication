async function login(event){
    event.preventDefault();
    try{
        const emailId = document.getElementById('emailid').value;
        const passId = document.getElementById('passid').value;

        const user = {
            emailId: emailId,
            passId: passId
        };

        axios.post("http://localhost:3000/user/login", user).then(response => {
            alert(response.data.message);
            localStorage.setItem('token', response.data.token);
            window.location.href = "http://localhost:3000/chat/dashboard";
        });

        document.getElementById('emailid').value = '';
        document.getElementById('passid').value = '';
    } catch(error) {
        if(error.response && error.response.status === 404){
            alert('Email id does not exist');
            document.getElementById('emailid').value = '';
            document.getElementById('passid').value = '';
        } else if(error.response && error.response.status === 401){
            alert('User not authorized');
            document.getElementById('emailid').value = '';
            document.getElementById('passid').value = '';
        } else{
            document.body.innerHTML += "<h4>Something went wrong</h4>";
            console.log(error);
        }
    }
}

const forgotpswButton = document.getElementById('forgotpsw');


forgotpswButton.onclick = async function () {
    try{
        window.location.href = 'http://localhost:3000/password/forgotForm';
        console.log('redirecting to forgot password form');
    } catch(err){
        console.log('error in redirecting to forgot password form: ', err);
    }
}