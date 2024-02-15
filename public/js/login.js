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
            window.location.href = "http://localhost:3000/user";
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